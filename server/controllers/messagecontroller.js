import fs from "fs";
import imagekit from "../configs/img.js";
import message from "../models/message.js";

const connections = {};

export const ssecontroller = (req, res) => {
  const { userId } = req.params;
  console.log("new client connected : ", userId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  connections[userId] = res;

  res.write("conneted to sse stream\n\n");

  req.on("close", () => {
    delete connections[userId];
    console.log("client disconnected : ", userId);
  });
};

export const sendmessage = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";

    let message_type = image ? "image" : "text";

    if (message_type === "image") {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });
      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const message = await message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });
    res.json({ success: true, message });
    const messagwithuserdata = await message
      .findById(message._id)
      .populate("from_user_id");
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messagwithuserdata)}\n\n`
      );
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getmessage = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { to_user_id } = req.body;
    const messages = await message
      .findById({
        $or: [
          { from_user_id: userId, to_user_id },
          { from_user_id: to_user_id, to_user_id: userId },
        ],
      })
      .sort({ createdAt: 1 });
    await message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true }
    );
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getrecentmessages = async (req, res) => {
  try {
    const { userId } = req.auth;
    const messages = await message
      .findById(
        {
          to_user_id: userId,
        }.populate("from_user_id")
      )
      .sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { getmessage, getrecentmessages };
