import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connections.js";
import sendEmail from "../configs/nodeMailer.js";
import story from "../models/story.js";
import message from "../models/message.js";

// Create a client
export const inngest = new Inngest({ id: "pingup-app" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    let username = email_addresses[0].email_address.split("@")[0];

    // Ensure unique username
    while (await User.findOne({ username })) {
      username = username + Math.floor(Math.random() * 10000);
    }
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    };

    await User.create(userData);
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const updatedUserData = {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    };

    await User.findByIdAndUpdate(id, updatedUserData);
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

const sentnewconnectionemail = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;
    await step.run("send-connnection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );
      const subject = `new connection request `;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
           <h2>Hi ${connection.to_user_id.full_name},</h2>
           <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
           <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
           <br/>
           <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });
    const in24hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-24-hours", in24hours);
    await step.run("send-connection-request-reminder", async (params) => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );

      if (connection.status === "accepted") {
        return { menubar: "Connection already accepted, no reminder needed." };
      }
      const subject = `new connection request `;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
           <h2>Hi ${connection.to_user_id.full_name},</h2>
           <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
           <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
           <br/>
           <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });

      return { menubar: "Reminder email sent for pending connection request." };
    });
  }
);

const deletestory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },
  async ({ event, step }) => {
    const { storyId } = event.data;
    const in24hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-24-hours", in24hours);
    await step.run("delete-story", async () => {
      await story.findByIdAndDelete(storyId);
      return { message: "story deleted successfully" };
    });
  }
);

const sendnotificationofunseenmessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },
  {
    cron: "TZ=America/New_York 0 9 * * *",
  },
  async ({ step }) => {
    const messages = await message.find({ seen: false }).populate("to_user_id");
    const unseencount = {};

    messages.map((message) => {
      unseencount[message.to_user_id._id] =
        (unseencount[message.to_user_id._id] || 0) + 1;
    });

    for (const userId in unseencount) {
      const user = await User.findById(userId);

      const subject = `You have ${unseencount[userId]} unseen messages`;

      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
           <h2>Hi ${user.full_name},</h2>
           <p>You have ${unseencount[userId]} unseen messages waiting for you on PingUp.</p>
           <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to check your messages</p>
           <br/>
           <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>;`;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }
    return{
      message: "Unseen messages notification sent successfully",
    }
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sentnewconnectionemail,
  deletestory,
  sendnotificationofunseenmessages
];
