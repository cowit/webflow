function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }

  const htmlElement = document.documentElement;
  const computed = getComputedStyle(htmlElement);
  let toggleEl;
  let togglePressed = "false";

  const scriptTag = document.querySelector("[tr-color-vars]");
  if (!scriptTag) {
    console.warn("Script tag with tr-color-vars attribute not found");
    return;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
  let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));

  const cssVariables = scriptTag.getAttribute("tr-color-vars");
  if (!cssVariables.length) {
    console.warn("Value of tr-color-vars attribute not found");
    return;
  }

  var primaryTheme = scriptTag.getAttribute("primary-theme");
  if (!primaryTheme) {
    console.warn(`Value of primary-theme not found. Setting to "color"`);
    primaryTheme = "color"
    return;
  }

  var secondaryTheme = scriptTag.getAttribute("secondary-theme");
  if (!secondaryTheme) {
    console.log(`Value of secondary-theme not found. Setting to "secondary"`);
    secondaryTheme = "secondary"
    return;
  }

  var toggleButton =scriptTag.getAttribute("toggle-button");
  if (!toggleButton) {
    console.log(`Value of toggle button not found. Setting to "mode-toggle"`);
    toggleButton = "mode-toggle"
    return;
  }

  var primaryLogo =scriptTag.getAttribute("primary-logo");
  if (!primaryLogo) {
    console.log(`Value of secondary logo svg not found. Setting to sun svg`);
    primaryLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>`
    return;
  }

  var secondaryLogo =scriptTag.getAttribute("secondary-logo");
  if (!secondaryLogo) {
    console.log(`Value of secondary logo svg not found. Setting to moon svg`);
    secondaryLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>`
    return;
  }

  var primaryLightMode = scriptTag.getAttribute("is-primary-light");
  if (!primaryLightMode) {
    console.warn(`Value of is-primary-light not found. Setting to "true" (Variable should be set to "true" if light theme is primary or "false" if dark theme is primary)`);
    primaryLightMode = "true"
    return;
  }
  let primaryColors = {};
  let secondaryColors = {};
  cssVariables.split(",").forEach(function (item) {
    let primaryValue = computed.getPropertyValue(`--${primaryTheme}--${item}`);
    let secondaryValue = computed.getPropertyValue(`--${secondaryTheme}--${item}`);
    if (primaryValue.length) {
      if (!secondaryValue.length) secondaryValue = primaryValue;
      
      primaryColors[`--${primaryTheme}--${item}`] = primaryValue;
      secondaryColors[`--${primaryTheme}--${item}`] = secondaryValue;
    }
  });

  if (!Object.keys(primaryColors).length) {
    console.warn("No variables found matching tr-color-vars attribute value");
    return;
  }

  function setColors(colorObject, animate) {
    if (typeof gsap !== "undefined" && animate) {
      gsap.to(htmlElement, {
        ...colorObject,
        duration: colorModeDuration,
        ease: colorModeEase
      });
    } else {
      Object.keys(colorObject).forEach(function (key) {
        htmlElement.style.setProperty(key, colorObject[key]);
      });
    }
  }

  function goSecondary(secondary, animate) {
    if (secondary) {
      localStorage.setItem("secondary-mode", "true");
      htmlElement.classList.add("secondary-mode");
      setColors(secondaryColors, animate);
      togglePressed = "true";
      $(`.${toggleButton}`).html(secondaryLogo)
    } else {
      localStorage.setItem("secondary-mode", "false");
      htmlElement.classList.remove("secondary-mode");
      setColors(primaryColors, animate);
      togglePressed = "false";
      $(`.${toggleButton}`).html(primaryLogo)
    }
    if (typeof toggleEl !== "undefined") {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  function checkPreference(e) {
    goSecondary(e.matches, false);
  }
  var colorPreference
  if(primaryLightMode === "true") {
    colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
    colorPreference.addEventListener("change", (e) => {
      checkPreference(e);
    });
  }
  else {
    colorPreference = window.matchMedia("(prefers-color-scheme: light)");
    colorPreference.addEventListener("change", (e) => {
      checkPreference(e);
    });
  }

  let storagePreference = localStorage.getItem("secondary-mode");
  if (storagePreference !== null) {
    storagePreference === "true" ? goSecondary(true, false) : goSecondary(false, false);
  } else {
    console.log(`Color Preference: ${colorPreference}`)
    checkPreference(colorPreference);
  }

  window.addEventListener("DOMContentLoaded", (event) => {
    toggleEl = document.querySelectorAll("[tr-color-toggle]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "View secondary Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
    });
    toggleEl.forEach(function (element) {
      element.addEventListener("click", function () {
        let secondaryClass = htmlElement.classList.contains("secondary-mode");
        secondaryClass ? goSecondary(false, true) : goSecondary(true, true);
      });
    });
  });
}
colorModeToggle();