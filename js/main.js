import { initSite } from "./site.js";
import { initProjects, renderProjectLists } from "./projects.js";

window.lucide?.createIcons();

renderProjectLists();
const siteApi = initSite();
const projectsApi = initProjects(siteApi);

projectsApi.applyInitialRoute();

window.addEventListener("hashchange", () => {
  projectsApi.handleHashChange();
});
