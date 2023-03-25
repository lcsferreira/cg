import { shopping } from "../data/shopping.js";
import { scale3D } from "../scripts/webGL/scale3d.js";

cartTotalItems();
showItems();

function cartTotalItems() {
  const total = document.getElementById("total");

  //get the cart from the localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));

  total.innerHTML = cart.length;
  //find the element with id "total" and set its innerHTML to the number of items in the cart
}

function showItems() {
  //create a list of items to be displayed  on the page, each item with class "item"
  const list = document.createElement("ul");

  //get the cart from the localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));
  //add each item to the list
  cart.forEach((item, index) => {
    const li = document.createElement("li");
    const div = itemComponent(item, index);
    li.appendChild(div);
    list.appendChild(li);
  });
  //add the list to the page in the div with id "items"
  document.getElementById("items").appendChild(list);
  cartTotalItems();
}

function removeItem(name, price) {
  //get the cart from localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));
  let indexRemove;
  //find the item in the cart and pop it
  cart.forEach((element, index) => {
    if (element.name === name && element.price === price) {
      indexRemove = index;
    }
  });

  console.log(indexRemove);
  const filteredCart = cart.filter((item, index) => index !== indexRemove);
  //save the cart to localstorage
  localStorage.setItem("cart", JSON.stringify(filteredCart));
  //reload page
  location.reload();
}

function visualize3D() {
  //create a modal to display the 3D model
  const modal = document.createElement("div");
  modal.className = "modal";
  //create a button to close the modal
  const button = document.createElement("button");
  button.innerHTML = "X";
  button.addEventListener("click", () => modal.remove());
  //add the button to the modal
  modal.appendChild(button);
  //add the modal to the page
  document.body.appendChild(modal);
  //create a canvas to display the 3D model
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  canvas.id = "canvas";
  //add the canvas to the modal
  //add another div to display the name and the price of the item
  const div = document.createElement("div");
  div.className = "item";
  //add the name of the item

  div.appendChild(canvas);

  const uiContainer = document.createElement("div");
  uiContainer.id = "uiContainer";
  const ui = document.createElement("div");
  ui.id = "ui";
  const x = document.createElement("div");
  x.id = "x";
  ui.appendChild(x);
  const y = document.createElement("div");
  y.id = "y";
  ui.appendChild(y);
  const z = document.createElement("div");
  z.id = "z";
  ui.appendChild(z);
  const angleX = document.createElement("div");

  angleX.id = "angleX";
  ui.appendChild(angleX);
  const angleY = document.createElement("div");
  angleY.id = "angleY";
  ui.appendChild(angleY);
  const angleZ = document.createElement("div");
  angleZ.id = "angleZ";
  ui.appendChild(angleZ);
  const scaleX = document.createElement("div");
  scaleX.id = "scaleX";
  ui.appendChild(scaleX);
  const scaleY = document.createElement("div");
  scaleY.id = "scaleY";
  ui.appendChild(scaleY);
  const scaleZ = document.createElement("div");
  scaleZ.id = "scaleZ";
  ui.appendChild(scaleZ);
  uiContainer.appendChild(ui);
  div.appendChild(uiContainer);
  //add the div to the modal
  modal.appendChild(div);

  //call the function to display the 3D model
  scale3D();
}

function itemComponent(item, index) {
  //create a div to append the name and the price of the item
  const div = document.createElement("div");
  div.className = "item";

  //create a div to append a canvas with id "object"
  const div0 = document.createElement("div");
  div0.className = "object";
  //add a canvas to the item
  const canvas = document.createElement("canvas");
  canvas.addEventListener("click", () => visualize3D(item));
  canvas.id = "object" + index;
  canvas.width = 300;
  canvas.height = 200;
  div0.appendChild(canvas);
  div.appendChild(div0);

  const div1 = document.createElement("div");
  div1.className = "info";
  //add a name to the item
  const name = document.createElement("p");
  name.innerHTML = item.name;
  div1.appendChild(name);
  //add a price to the item
  const price = document.createElement("p");
  price.innerHTML = item.price;
  div1.appendChild(price);
  div.appendChild(div1);

  //create another div to append the button
  const div2 = document.createElement("div");
  div2.className = "remove-button";
  //add a button to the item
  const button = document.createElement("button");
  button.innerHTML = "Remove from cart";
  button.addEventListener("click", () => removeItem(item.name, item.price));
  div2.appendChild(button);
  div.appendChild(div2);
  //add the item to the cart when clicked
  return div;
}
