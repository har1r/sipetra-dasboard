import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { User } from "@/models/user";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ WEBHOOK_SECRET TIDAK DITEMUKAN");
    return new Response("Internal Server Error", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      await connectDB();

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          email: email_addresses[0].email_address,
          $setOnInsert: {
            role: "penginput",
            stages: ["penginputan"],
          },
        },
        { upsert: true, new: true },
      );

      return new Response("Success", { status: 200 });
    } catch (error: any) {
      console.error("❌ Database Error:", error.message);
      return new Response("Database Error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
