import { Router } from "express";
import { SubmitContactBody } from "@workspace/api-zod";

const router = Router();

router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  req.log.info("Contact form submission received");

  res.json({
    success: true,
    message: "Message received. Will respond when I resurface from the current hyperfocus session.",
  });
});

export default router;
