"use server";
import { prisma } from "../app/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";

export async function createTicket(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    if (!subject || !description || !priority) {
      logEvent(
        "Validation Error: Missing ticket fields",
        "ticket",
        {
          subject,
          description,
          priority,
        },
        "warning"
      );
      return {
        success: false,
        message: "All fields are required",
      };
    }
    // Create Ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
      },
    });
    logEvent(
      `Ticket created sucessfully: ${ticket.id}`,
      "ticket",
      {
        subject,
        description,
        priority,
      },
      "info"
    );
    revalidatePath("/tickets");
    return {
      success: true,
      message: "Ticket created successfully",
    };
  } catch (error) {
    logEvent(
      "an error occurred while creating the ticket",
      "ticket",
      {
        formData: Object.fromEntries(formData.entries()),
      },
      "error",
      error
    );
    return {
      success: false,
      message: "An error occurred while creating the ticket",
    };
  }
}

export async function getTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    logEvent(
      "Fetched tickets list",
      "ticket",
      {
        count: tickets.length,
      },
      "info"
    );

    return tickets;
  } catch (error) {
    logEvent("Error while fetching data", "ticket", {}, "error", error);

    return [];
  }
}
