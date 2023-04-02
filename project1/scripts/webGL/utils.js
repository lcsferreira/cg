const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

const addToCart = (itemName, objHref, textureIndex, price) => {
  //get the cart from local storage, if dont exist create it
  var cart = JSON.parse(localStorage.getItem("cart"));
  if (cart == null) {
    cart = [];
  }
  //add the item to the cart
  obj = {
    name: itemName,
    href: objHref,
    textureIndex: String(textureIndex),
    price: price,
  };

  cart.push(obj);
  document.getElementById("total").innerHTML = `${cart.length}`;
  //save the cart to local storage
  localStorage.setItem("cart", JSON.stringify(cart));
};

const totalPrice = () => {
  var cart = JSON.parse(localStorage.getItem("cart"));
  var totalPrice = 0.0;
  if (cart == null) {
    cart = [];
  } else {
    cart.forEach((item) => {
      totalPrice += Number(item.price);
    });
  }
  //limit the number of decimals
  totalPrice = totalPrice.toFixed(2);
  document.getElementById("totalPrice").innerHTML = `${totalPrice}`;
};

const setRectangle = (gl, x, y, width, height) => {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
};

const removeFromCart = (index) => {
  console.log(index);
  //get the cart from local storage
  var cart = JSON.parse(localStorage.getItem("cart"));
  //remove the item from the cart
  cart.splice(index, 1);
  //save the cart to local storage
  localStorage.setItem("cart", JSON.stringify(cart));
  //reload the page
  location.reload();
};

const listItems = () => {
  var cart = JSON.parse(localStorage.getItem("cart"));
  if (cart == null) {
    cart = [];
  } else {
    cart.forEach((item, index) => {
      const cardTemplate = `
      <div class='card-container'>
      <div>
      <p>${String(index + 1)}</p>
      </div>
      <div>
      <p>${String(item.name)}</p>
        </div>
        <div>
        <button class='btn-remove' onclick='removeFromCart(${index})'><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button>
        </div>
        </div>`;

      const div = document.createElement("div");
      div.innerHTML = cardTemplate.trim();
      const divList = document.getElementById("itemsList");
      divList.appendChild(div.firstChild);
    });
  }
};
