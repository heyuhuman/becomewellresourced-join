// ====== PERSONALIZED KICKERS ======
(function(){
  const params = new URLSearchParams(window.location.search);
  const rawName = params.get("name");

  const topKicker = document.querySelector(".kicker:not(.bottomKicker)");
  const bottomKicker = document.querySelector(".bottomKicker");

  if(!rawName){
    // No name in URL — leave default text
    return;
  }

  // Clean + format name safely
  const name = decodeURIComponent(rawName)
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if(topKicker){
    topKicker.textContent = `${name}, WELCOME TO THE`;
  }

  if(bottomKicker){
    bottomKicker.textContent = `${name}… JOIN US INSIDE THE`;
  }
})();
