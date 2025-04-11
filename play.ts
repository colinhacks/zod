import * as z from "zod";

const VideoSharedAttrsZ = z.object({
  height: z.string().or(z.number()).nullish(),
  thumbnail_height: z.string().or(z.number()).nullish(),
  thumbnail_url: z.string().nullish(),
  thumbnail_width: z.string().or(z.number()).nullish(),
  title: z.string().nullish(),
  width: z.string().or(z.number()).nullish(),
});

const extended = z
  .object({
    youtube_id: z.string(),
  })
  .extend(VideoSharedAttrsZ);

VideoSharedAttrsZ._zod;

const VideoYoutubeBlockZ = z.object({
  type: z.literal("Block.VideoYoutube"),
  attrs: z
    .object({
      youtube_id: z.string(),
    })
    .extend(VideoSharedAttrsZ),
});

const VideoYoutubeBlockZ2 = z.object({
  type: z.literal("Block.VideoYoutube2"),
  attrs: z
    .object({
      youtube_id: z.string(),
    })
    .extend(VideoSharedAttrsZ),
});

const BlockZ = z.discriminatedUnion("type", [VideoYoutubeBlockZ, VideoYoutubeBlockZ2]);
type BlockZ = typeof BlockZ._zod.output;
