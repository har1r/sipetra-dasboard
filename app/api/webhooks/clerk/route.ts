import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { User } from "@/models/user";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
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
    console.error("Webhook verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;
  await connectDB();

  try {
    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address;

        if (!email) {
          console.warn("Email tidak ditemukan");
          return new Response("No email", { status: 400 });
        }

        const name =
          [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
          "User";

        await User.updateOne(
          { clerkId: data.id },
          {
            $set: {
              name,
              email,
            },
            $setOnInsert: {
              role: "penginput",
            },
          },
          { upsert: true },
        );

        break;
      }

      case "user.deleted": {
        await User.deleteOne({ clerkId: data.id });
        break;
      }

      default:
        console.log(`Unhandled event: ${type}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Database error:", error.message);
    return new Response("Database error", { status: 500 });
  }
}
