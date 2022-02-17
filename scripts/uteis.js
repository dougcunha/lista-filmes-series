const uteis = {
    //  (A) RETORNA TODOS OS ELEMENTOS VIZINHOS DO MESMO TIPO NA MESMA LINHA
    //  elemento: Um dos elementos.
    procurarVizinhos: elemento => {
        const top = elemento.getBoundingClientRect().top;
        const pai = elemento.parentElement;
        const selector = uteis.getSelector(elemento);
        console.log(selector);

        const vizinhos = [...pai.querySelectorAll(selector)]
          .filter(e => e.getBoundingClientRect().top == top);

        return vizinhos;
    },
    // (B) RETORNA O SELETOR CSS UNICO DESSE ELEMENTO
    // elemento: O elemento.
    getSelectorUnique: elemento =>
    {
      if (elemento.tagName === "BODY") return "BODY";
      const names = [];

      while (elemento.parentElement && elemento.tagName !== "BODY") {
          if (elemento.id) {
              names.unshift("#" + elemento.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
              break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
          } else {
              let c = 1, e = elemento;
              for (; e.previousElementSibling; e = e.previousElementSibling, c++) ;
              names.unshift(elemento.tagName + ":nth-child(" + c + ")");
          }
          elemento = elemento.parentElement;
      }

      return names.join(">");
    },
    // (C) RETORNA O SELETOR CSS GENÉRICO DO ELEMENTO.
    // elemento: O elemento.
    getSelector: elemento => {
      if (elemento.tagName.toLowerCase() == "html")
          return "HTML";
      var str = elemento.tagName;
      str += (elemento.id != "") ? "#" + elemento.id : "";
      if (elemento.className) {
          var classes = elemento.className.split(/\s/);
          for (var i = 0; i < classes.length; i++) {
              str += "." + classes[i]
          }
      }

      return uteis.getSelector(elemento.parentNode) + " > " + str;
  }
};

export { uteis };