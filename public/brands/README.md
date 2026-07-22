# Third-Party Brand Assets

No Apple Pay artwork is currently stored in this directory. The homepage uses
a text fallback until approved artwork is supplied.

If the Apple Pay mark is added:

1. Download it only from Apple's current Apple Pay Marketing Guidelines and
   artwork resources.
2. Confirm that the selected light- or dark-background artwork is appropriate
   for the homepage's black/charcoal surface.
3. Store the unmodified file as `public/brands/apple-pay-mark.svg` (or retain
   Apple's supplied format if SVG is not provided).
4. Preserve the mark's aspect ratio, border, and required clear space. Do not
   redraw, recolor, crop, animate, or add visual effects.
5. Keep adjacent visible copy that states Apple Pay availability so the
   announcement remains understandable if the image does not load. Use an
   empty `alt` value when that adjacent copy makes a logo description
   redundant.
6. Update the focused homepage test to assert that the image uses the local
   `/brands/` asset and is not a remote URL.

Apple Pay branding must continue to follow Apple's official marketing
guidelines. Artwork from third-party logo websites is not permitted.
