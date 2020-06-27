# Shepard Tone

Web Audio implementation for [Shepard Tone](https://en.wikipedia.org/wiki/Shepard_tone)
Based on [Jordan Eldredge's article](https://jordaneldredge.com/blog/creating-the-shepard-tone-audio-illusion-with-javascript/)

```
npm install shepard-tone
```

### Usage

```javascript
import { ShepardTone, createAudioContext } from "shepard-tone";

const shepardTone = new ShepardTone(createAudioContext());
shepardTone.play();
```

### [Demo](https://515ut.csb.app/)
