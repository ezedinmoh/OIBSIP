document.addEventListener("DOMContentLoaded", function () {
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Timeline content stays in one data structure so the markup remains easy to maintain.
  var events = [
    {
      year: "1818",
      title: "Born as Kassa Hailu",
      text: "Born in Qwara, on Ethiopia's north-western frontier, into a period of fractured imperial authority.",
    },
    {
      year: "1855",
      title: "Crowned Tewodros II",
      text: "After defeating the leading regional lords, Kassa Hailu is crowned Emperor and takes a throne name laden with prophecy.",
    },
    {
      year: "1862",
      title: "Letter to Queen Victoria",
      text: "He writes to Queen Victoria seeking friendship and British assistance, including military training and access to skills and technology.",
    },
    {
      year: "1864",
      title: "The hostage crisis",
      text: "Tewodros imprisons British consul Charles Duncan Cameron and other Europeans, turning a diplomatic dispute into an international crisis.",
    },
    {
      year: "1867",
      title: "British expedition begins",
      text: "A large expeditionary force under Robert Napier lands on the Red Sea coast and advances inland toward the highlands.",
    },
    {
      year: "10 Apr 1868",
      title: "Battle of Aroge",
      text: "Below the Maqdala plateau, Tewodros's forces meet modern artillery and rockets. The outcome is decisive.",
    },
    {
      year: "13 Apr 1868",
      title: "Maqdala falls",
      text: "The fortress is stormed. Tewodros dies rather than surrender; the stronghold is later destroyed and cultural material is carried away.",
    },
  ];

  var list = document.getElementById("timeline-list");
  if (list) {
    events.forEach(function (e, i) {
      var li = document.createElement("li");
      li.className = "reveal";
      li.style.transitionDelay = i * 60 + "ms";
      li.innerHTML =
        '<div class="t-inner">' +
        '<p class="eyebrow accent">' +
        e.year +
        "</p>" +
        "<h3>" +
        e.title +
        "</h3>" +
        '<p class="t-text">' +
        e.text +
        "</p>" +
        "</div>";
      list.appendChild(li);
    });
  }

  // Reveal sections as they enter the viewport, with a reduced-motion fallback.
  var revealables = document.querySelectorAll(".reveal:not(.is-visible)");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    revealables.forEach(function (el) {
      io.observe(el);
    });
  }

  // Keep navigation and the back-to-top control lightweight and scroll-aware.
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 80);
    if (toTop) toTop.classList.toggle("is-shown", y > 900);

    // Gentle parallax on the Maqdala photograph.
    if (!reduceMotion) {
      var img = document.querySelector("[data-parallax]");
      if (img) {
        var rect = img.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var progress =
            (window.innerHeight - rect.top) /
            (window.innerHeight + rect.height);
          img.style.transform =
            "scale(1.08) translateY(" + (progress * -28).toFixed(2) + "px)";
        }
      }
    }
  }

  var navLinks = document.querySelectorAll("[data-nav-target]");
  var sections = Array.prototype.map
    .call(navLinks, function (link) {
      return document.getElementById(link.getAttribute("data-nav-target"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              var active =
                link.getAttribute("data-nav-target") === entry.target.id;
              link.classList.toggle("is-active", active);
              if (active) link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
