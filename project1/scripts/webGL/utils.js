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
  document.getElementById("totalPrice").innerHTML = `${totalPrice}`;
};
