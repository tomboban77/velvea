# Design refresh — editorial image

Asset: `public/images/gifting-editorial.webp` (1440 × 960, 137,652 bytes).
Created with the built-in imagegen tool, then compressed to WebP. Used as atelier inspiration in the custom-gifting feature and as the hero fallback when no catalog photograph is available. Actual catalog photography remains connected to product data.

Final generation prompt:

> Use case: photorealistic-natural. Create one premium editorial still-life photograph for Velvea, a sophisticated Canadian gift atelier website. Landscape 3:2 composition. Two luxurious closed ivory gift boxes, one larger one smaller, tied with wide deep burgundy-plum satin ribbon, a small blank cream note card resting on a travertine table, a delicate branch of pale blush flowers entering from upper right. Warm off-white plaster backdrop, afternoon sunlight from upper left, beautiful soft shadows, subtle film grain, restrained luxury magazine art direction. Rich tactile paper, natural ribbon folds, photorealistic not 3D. Boxes positioned in center and lower half with generous breathing room. Palette ivory, champagne, warm beige, dark wine plum. No words, no logo, no watermarks, no people. This is an atmospheric brand image, not an actual catalog product.

Validation: lint passed with 12 existing unused-import warnings. Direct Next.js production build passed, including TypeScript checks and generation of 56 static pages. The package build command's Prisma regeneration step encountered an existing Windows DLL lock; the successful direct build used the already-generated client. Visual checks are being handled by the user.
