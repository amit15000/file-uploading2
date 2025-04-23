import pLimit from "p-limit";
const limit = pLimit(3);
function resizeImage(id) {
  return new Promise((resolve) => {
    console.log("Starting", id);
    setTimeout(() => {
      console.log("Done", id);
      resolve(id);
    }, 1000);
  });
}
const tasks = [1, 2, 3, 4, 5, 6].map((id) => limit(() => resizeImage(id)));
Promise.all(tasks).then((results) => {
  console.log("All done:", results);
});
