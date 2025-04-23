import pLimit from "p-limit";
const limit = pLimit(3);

const resizeImage = (id, time) => {
  return new Promise((resolve) => {
    console.log(`Starting image ${id}`);
    setTimeout(() => {
      console.log(`Finished Image ${id}`);
      resolve(id);
    }, time);
  });
};
const images = [
  { id: 1, time: 2000 },
  { id: 2, time: 1000 },
  { id: 3, time: 1500 },
  { id: 4, time: 3000 },
  { id: 5, time: 2500 },
  { id: 6, time: 1200 },
];

//wrap image resize task with plimit

const task = images.map((img) => limit(() => resizeImage(img.id, img.time)));
console.time("Total time");
Promise.all(task).then((result) => {
  console.log("All images processed :", result);
  console.timeEnd("Total time");
});
