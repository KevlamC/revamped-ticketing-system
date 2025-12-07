document.addEventListener("DOMContentLoaded", function () {
  const placeholder = document.getElementById("header-placeholder");
  if (placeholder) {
    fetch("components/header.html")
      .then((response) => response.text())
      .then((data) => {
        placeholder.innerHTML = data;

        // Execute scripts found in the injected HTML
        const scripts = placeholder.querySelectorAll("script");
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Dispatch event in case other parts of the app still need to know
        document.dispatchEvent(new Event("headerLoaded"));
      })
      .catch((error) => console.error("Error loading header:", error));
  }
});
