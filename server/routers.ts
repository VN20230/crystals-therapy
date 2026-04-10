import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createReservation, getAllReservations, createContactMessage, getAllContactMessages } from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  reservations: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        serviceType: z.string().min(1),
        reservationDate: z.date(),
        duration: z.number().int().positive(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const reservation = await createReservation({
          name: input.name,
          email: input.email,
          phone: input.phone,
          serviceType: input.serviceType,
          reservationDate: input.reservationDate,
          duration: input.duration,
          notes: input.notes,
          status: "pending",
        });

        // Send email notification to owner
        try {
          await notifyOwner({
            title: "New Reservation Received",
            content: `${input.name} has booked a ${input.serviceType} massage for ${new Date(input.reservationDate).toLocaleDateString()}. Email: ${input.email}${input.phone ? `, Phone: ${input.phone}` : ''}${input.notes ? `. Notes: ${input.notes}` : ''}`,
          });
        } catch (error) {
          console.error("Failed to send email notification:", error);
        }

        // Send SMS notification if phone is available
        if (input.phone) {
          try {
            const smsMessage = `New booking: ${input.name} reserved ${input.serviceType} on ${new Date(input.reservationDate).toLocaleDateString()}`;
            // SMS sending would be implemented here with a service like Twilio
            console.log(`[SMS] ${smsMessage}`);
          } catch (error) {
            console.error("Failed to send SMS notification:", error);
          }
        }

        return reservation;
      }),
    getAll: publicProcedure.query(async () => {
      return await getAllReservations();
    }),
  }),

  messages: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const contactMessage = await createContactMessage({
          name: input.name,
          email: input.email,
          message: input.message,
          status: "unread",
        });

        // Send email notification to owner
        try {
          const messagePreview = input.message.substring(0, 150) + (input.message.length > 150 ? "..." : "");
          await notifyOwner({
            title: "New Contact Message Received",
            content: `${input.name} sent you a message: "${messagePreview}" Email: ${input.email}`,
          });
        } catch (error) {
          console.error("Failed to send email notification:", error);
        }

        // Log SMS notification (in production, integrate with Twilio or similar)
        try {
          const smsMessage = `New message from ${input.name}: ${input.message.substring(0, 100)}...`;
          console.log(`[SMS] ${smsMessage}`);
        } catch (error) {
          console.error("Failed to send SMS notification:", error);
        }

        return contactMessage;
      }),
    getAll: publicProcedure.query(async () => {
      return await getAllContactMessages();
    }),
  }),


});

export type AppRouter = typeof appRouter;
