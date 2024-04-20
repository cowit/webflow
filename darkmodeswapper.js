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
    } else {
      localStorage.setItem("secondary-mode", "false");
      htmlElement.classList.remove("secondary-mode");
      setColors(primaryColors, animate);
      togglePressed = "false";
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