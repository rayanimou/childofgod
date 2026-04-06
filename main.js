const trigger = document.getElementById("coverTrigger");
const teaserAudio = document.getElementById("teaserAudio");
const countdownValue = document.getElementById("countdownValue");
const hoverVideo = document.getElementById("hoverVideo");
const hoverVideoZone = document.getElementById("hoverVideoZone");

const isTouchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches;

let revealed = false;
let touchPreviewTimer;

const revealAndPlay = async () => {
  if (revealed) {
    return;
  }

  revealed = true;
  document.body.classList.add("is-revealed");

  if (!teaserAudio) {
    return;
  }

  teaserAudio.volume = 1;

  try {
    await teaserAudio.play();
  } catch (error) {
    // Some browsers still require another interaction.
  }
};

trigger?.addEventListener("click", () => {
  revealAndPlay();
});

const toggleDarkMode = () => {
  document.body.classList.toggle("is-dark");
};

const safeResetVideo = () => {
  if (!hoverVideo) {
    return;
  }

  hoverVideo.pause();

  try {
    hoverVideo.currentTime = 0;
  } catch (error) {
    // Ignore seek issues while metadata is still loading.
  }
};

const playHoverVideo = async () => {
  if (!hoverVideo) {
    return;
  }

  try {
    await hoverVideo.play();
  } catch (error) {
    // Ignore autoplay/interaction restrictions.
  }
};

const launchTouchPreview = async () => {
  clearTimeout(touchPreviewTimer);
  await playHoverVideo();
  touchPreviewTimer = setTimeout(() => {
    safeResetVideo();
  }, 1200);
};

if (hoverVideo) {
  hoverVideo.muted = true;
  hoverVideo.loop = true;

  hoverVideo.addEventListener(
    "loadeddata",
    async () => {
      // Prime first frame so the video reads like a static visual before hover/tap.
      try {
        await hoverVideo.play();
      } catch (error) {
        // If play is blocked, we still keep the paused state.
      }

      safeResetVideo();
    },
    { once: true }
  );
}

if (!isTouchLike) {
  hoverVideoZone?.addEventListener("pointerenter", playHoverVideo);
  hoverVideoZone?.addEventListener("pointerleave", safeResetVideo);
} else {
  hoverVideoZone?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      launchTouchPreview();
    }
  });
}

hoverVideoZone?.addEventListener("pointercancel", safeResetVideo);
hoverVideoZone?.addEventListener("focusin", playHoverVideo);
hoverVideoZone?.addEventListener("focusout", safeResetVideo);
hoverVideoZone?.addEventListener("click", toggleDarkMode);
hoverVideoZone?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleDarkMode();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    safeResetVideo();
  }
});

const countdownTargetMs = new Date("2026-04-10T23:59:00+02:00").getTime();

const pad = (value) => String(value).padStart(2, "0");

const updateCountdown = () => {
  if (!countdownValue) {
    return;
  }

  const now = Date.now();
  const remaining = Math.max(0, countdownTargetMs - now);

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;

  const days = Math.floor(remaining / dayMs);
  const hours = Math.floor((remaining % dayMs) / hourMs);
  const minutes = Math.floor((remaining % hourMs) / minuteMs);
  const seconds = Math.floor((remaining % minuteMs) / 1000);

  countdownValue.textContent = `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
};

updateCountdown();
setInterval(updateCountdown, 1000);
