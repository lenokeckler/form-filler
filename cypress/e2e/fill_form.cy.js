// fill_form.cy.js
// Llena el formulario N veces con respuestas generadas por IA

// ⚙️ CONFIGURACIÓN — edita estos valores
const CONFIG = {
  FORM_URL:
    "https://docs.google.com/forms/d/e/1FAIpQLSdXKErUN5WJvvZgtCY8jwlTHc35D3yYVvLxDtN90RErQ8GmGQ/viewform",
  REPETICIONES: 2,
  // La GEMINI_API_KEY se lee desde el archivo .env (ver README). No la pongas aquí.
  DELAY_ENTRE_ENVIOS: 3000,
};


// Helpers
function nextPage() {
  cy.get('[jsname="OCpkoe"]').click({ force: true });
  cy.wait(1500);
}


// TEST PRINCIPAL
describe("Llenado automático del formulario con IA", () => {

  for (let i = 0; i < CONFIG.REPETICIONES; i++) {
    it(`Envío #${i + 1}`, () => {
      cy.task("generateAnswers").then((data) => {
        cy.log("Respuestas generadas:", JSON.stringify(data));

        
        // PÁGINA 1 — Consentimiento
        cy.visit(CONFIG.FORM_URL);
        cy.wait(2000);

        cy.get('[data-answer-value="Acepto"]').click({ force: true });

        nextPage();

        
        // PÁGINA 2 — Perfil del estudiante     
        cy.contains('[role="heading"]', "Provincia en la que reside")
          .closest('[jsmodel="CP1oW"]')
          .find(`[data-value="${data.provincia}"]`)
          .click({ force: true });

        cy.contains('[role="heading"]', "Sede a la que pertenece")
          .closest('[jsmodel="CP1oW"]')
          .find(`[data-value="${data.sede}"]`)
          .click({ force: true });

        cy.contains('[role="heading"]', "Edad")
          .closest('[jsmodel="CP1oW"]')
          .find(`[data-value="${data.edad}"]`)
          .click({ force: true });

        cy.contains('[role="heading"]', "Año de carrera")
          .closest('[jsmodel="CP1oW"]')
          .find(`[data-value="${data.anio_carrera}"]`)
          .click({ force: true });

        cy.contains('[role="heading"]', "experiencia previa en programación")
          .closest('[jsmodel="CP1oW"]')
          .find(`[data-value="${data.experiencia_previa}"]`)
          .click({ force: true });

        cy.contains('[role="heading"]', "trabaja mientras estudia")
          .closest('[jsmodel="CP1oW"]')
          .find(`[data-value="${data.trabaja}"]`)
          .click({ force: true });

        nextPage();

        
        // PÁGINA 3 — Experiencia general (7 preguntas Likert)
        const preguntasExp = [
          "participando activamente en clase",
          "aportes y opiniones son tomados en serio",
          "igualdad de condiciones para participar",
          "integrada e incluida en los grupos",
          "segura al expresar mi desacuerdo",
          "ambiente general de la carrera es inclusivo",
          "considerado abandonar la carrera",
        ];

        ["p1", "p2", "p3", "p4", "p5", "p6", "p7"].forEach((key, idx) => {
          cy.contains('[role="heading"]', preguntasExp[idx])
            .closest('[jsmodel="CP1oW"]')
            .find(`[data-value="${data.exp_general[key]}"]`)
            .click({ force: true });
        });

        nextPage();

        
        // PÁGINA 4 — Percepción de prácticas (A, B, C, D)
        const todasRespuestas = [
          ...data.interacciones,
          ...data.evaluaciones,
          ...data.lenguaje,
          ...data.expectativas,
        ];

        todasRespuestas.forEach((item, idx) => {
          // Likert: radiogroup en posición par (0, 2, 4...)
          cy.get('[role="radiogroup"]')
            .eq(idx * 2)
            .find(`[data-value="${item.escala}"]`)
            .click({ force: true });

          // Sí/No: radiogroup en posición impar (1, 3, 5...)
          cy.get('[role="radiogroup"]')
            .eq(idx * 2 + 1)
            .find(`[data-value="${item.experimento}"]`)
            .click({ force: true });

          // Descripción opcional
          if (item.experimento === "Sí" && item.descripcion && item.descripcion.trim() !== "") {
            cy.get('textarea[jsname="YPqjbf"]')
              .eq(idx)
              .type(item.descripcion, { delay: 15 });
          }
        });

        nextPage();

        
        // PÁGINA 5 — Estrategias (checkboxes)
        data.estrategias.forEach((estrategia) => {
          cy.get(`[data-answer-value="${estrategia}"]`).click({ force: true });
        });

        nextPage();

        
        // PÁGINA 6 — Comentario final
        if (data.comentario_final && data.comentario_final.trim() !== "") {
          cy.get('textarea[jsname="YPqjbf"]')
            .first()
            .type(data.comentario_final, { delay: 15 });
        }

        
        // ENVIAR
        cy.get('[jsname="M2UYVd"]').click({ force: true });
        cy.contains("Respuesta registrada", { timeout: 10000 }).should("exist");
        cy.log(`✅ Envío #${i + 1} completado`);
        cy.wait(CONFIG.DELAY_ENTRE_ENVIOS);
      });
    });
  }
});
