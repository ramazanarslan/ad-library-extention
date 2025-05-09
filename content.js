// content.js
function createButtons() {
  // Check if buttons already exist
  if (document.getElementById("download-videos-btn")) {
    return;
  }

  // Create container for buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "video-buttons-container";
  buttonContainer.style.position = "fixed";
  buttonContainer.style.top = "0";
  buttonContainer.style.left = "50%";
  buttonContainer.style.transform = "translateX(-50%)";
  buttonContainer.style.zIndex = "9999";
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.gap = "5px";

  // Create download button
  const downloadButton = document.createElement("button");
  downloadButton.id = "download-videos-btn";
  downloadButton.textContent = "Download All Videos";

  // Style the download button
  downloadButton.style.marginTop = "40px";
  downloadButton.style.padding = "10px 15px";
  downloadButton.style.backgroundColor = "#4267B2";
  downloadButton.style.color = "white";
  downloadButton.style.border = "none";
  downloadButton.style.borderRadius = "4px 4px 0 0";
  downloadButton.style.cursor = "pointer";
  downloadButton.style.fontWeight = "bold";
  downloadButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  downloadButton.style.width = "180px";

  // Add hover effect to download button
  downloadButton.onmouseover = () => {
    downloadButton.style.backgroundColor = "#365899";
  };
  downloadButton.onmouseout = () => {
    downloadButton.style.backgroundColor = "#4267B2";
  };

  // Create count button
  const countButton = document.createElement("button");
  countButton.id = "count-videos-btn";
  countButton.textContent = "Count Videos";

  // Style the count button
  countButton.style.padding = "10px 15px";
  countButton.style.backgroundColor = "#4CAF50";
  countButton.style.color = "white";
  countButton.style.border = "none";
  countButton.style.borderRadius = "0 0 4px 4px";
  countButton.style.cursor = "pointer";
  countButton.style.fontWeight = "bold";
  countButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  countButton.style.width = "180px";

  // Add hover effect to count button
  countButton.onmouseover = () => {
    countButton.style.backgroundColor = "#3e8e41";
  };
  countButton.onmouseout = () => {
    countButton.style.backgroundColor = "#4CAF50";
  };

  // Add buttons to container
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(countButton);

  // Add container to document
  document.body.appendChild(buttonContainer);

  // Add click event listeners
  downloadButton.addEventListener("click", downloadAllVideos);
  countButton.addEventListener("click", countAvailableVideos);
}

function countAvailableVideos() {
  const countButton = document.getElementById("count-videos-btn");

  // Count videos
  const videoElements = document.querySelectorAll("video");
  const videoArray = Array.from(videoElements);
  const downloadableVideos = videoArray.filter((video) => {
    return video.src || getVideoSource(video);
  });

  // Count structured images (a > div > img)
  const structuredImages = document.querySelectorAll("a div img");
  const structuredImagesArray = Array.from(structuredImages);
  const downloadableStructuredImages = structuredImagesArray.filter((img) => {
    return img.src && img.src !== "";
  });

  // Prepare message with counts
  let message = "";

  if (videoArray.length === 0 && structuredImagesArray.length === 0) {
    message = "No videos or images found";
  } else {
    message = `Found: ${downloadableVideos.length} videos, ${downloadableStructuredImages.length} images`;
  }

  countButton.textContent = message;
}

async function downloadAllVideos() {
  const button = document.getElementById("download-videos-btn");
  const videoElements = document.querySelectorAll("video");
  const videoArray = Array.from(videoElements);

  if (videoArray.length === 0) {
    button.textContent = "No videos found";
    setTimeout(() => {
      button.textContent = "Download All Videos";
    }, 3000);
    return;
  }

  button.textContent = `Found ${videoArray.length} videos`;

  // Track progress
  let completedDownloads = 0;
  let successCount = 0;
  let errorCount = 0;

  const updateProgress = (isSuccess) => {
    completedDownloads++;
    if (isSuccess) {
      successCount++;
    } else {
      errorCount++;
    }
    button.textContent = `Downloading... ${completedDownloads}/${videoArray.length} (Success: ${successCount}, Error: ${errorCount})`;
  };

  try {
    // Sequential download
    for (let index = 0; index < videoArray.length; index++) {
      const video = videoArray[index];
      try {
        const videoSrc = video.src || getVideoSource(video);

        if (!videoSrc) {
          console.log("No source found for video:", video);
          updateProgress(false);
          continue;
        }

        console.log("Downloading video:", index, videoSrc);

        // Download the video
        const result = await downloadVideo(videoSrc, index);
        updateProgress(result !== null);
      } catch (error) {
        console.error("Error downloading video:", index, error);
        updateProgress(false);
      }
    }

    button.textContent = `Done! Downloaded videos (Success: ${successCount}, Error: ${errorCount})`;

    setTimeout(() => {
      button.textContent = "Download All Videos";
    }, 5000);
  } catch (error) {
    console.error("Error in download process:", error);
    button.textContent = `Error downloading videos (Success: ${successCount}, Error: ${errorCount})`;

    setTimeout(() => {
      button.textContent = "Download All Videos";
    }, 3000);
  }
}

// For videos that might be using blob URLs or other sources
function getVideoSource(videoElement) {
  // Try to get src directly
  if (videoElement.src && videoElement.src !== "") {
    return videoElement.src;
  }

  // Try to get source from source elements
  const sources = videoElement.querySelectorAll("source");
  for (const source of sources) {
    if (source.src && source.src !== "") {
      return source.src;
    }
  }

  // Check for blob URL in currentSrc
  if (videoElement.currentSrc && videoElement.currentSrc !== "") {
    return videoElement.currentSrc;
  }

  // Check data attributes that might contain video URLs
  for (const attr of videoElement.attributes) {
    if (attr.name.includes("src") || attr.name.includes("data")) {
      if (attr.value && attr.value.includes("http")) {
        return attr.value;
      }
    }
  }

  return null;
}

async function downloadVideo(url, index) {
  try {
    // For all URLs, fetch the content first to ensure proper download
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Create a temporary link element to trigger download
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `fb_ad_video_${index + 1}.mp4`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    }, 100);

    return url;
  } catch (error) {
    console.error(`Error downloading video ${index + 1}:`, error);
    return null;
  }
}

// Add the buttons as soon as the page loads
createButtons();

// Re-check periodically as Facebook might load content dynamically
setInterval(createButtons, 3000);

// Also listen for potential page content changes
const observer = new MutationObserver(() => {
  createButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
