import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  ngOnInit() {
    interface Product {
      name: string;
      description?: string;
      price: number;
      img?: string;
      limit: number;
    }

    class Cart {
      productsInCart: BehaviorSubject<Record<string, number>>;

      constructor() {
        this.productsInCart = new BehaviorSubject<Record<string, number>>({});
      }

      public addProduct(product: Product) {
        if (product.limit > 0) {
          let currStream = this.productsInCart.getValue();
          currStream[product.name] = 1;
          this.productsInCart.next(currStream);
        } else
          console.log("Sold out!");
      }

      public updateProductAmount(product: Product, amount: number) {
        if (product.limit >= amount) {
          let currStream = this.productsInCart.getValue();
          currStream[product.name] = amount;
          this.productsInCart.next(currStream);
        } else
          console.log("You can buy maximum " + product.limit + " " + product.name);
      }

      public removeProduct(product: Product) {
        let tempProd = this.productsInCart.getValue();
        delete tempProd[product.name];
        this.productsInCart.next(tempProd);
      }

      public getTotalPrice(stock: Observable<Product[]>) {
        let totalPrice = 0;
        combineLatest([this.productsInCart, stock]).subscribe(([cart, stock]) => {
          const arrayProductsCart: string[] = Object.keys(cart);
          totalPrice = arrayProductsCart.reduce((total, item) =>
            total + (cart[item] * stock.find((prod) => prod.name === item).price)
            , 0);
        })
        console.log(totalPrice);
      }

      public checkout(stock: Observable<Product[]>) {
        combineLatest([this.productsInCart, stock]).subscribe(([cart, stock]) => {
          const arrayProductsCart: string[] = Object.keys(cart);
          arrayProductsCart.map(cartItem => {
            const stockProduct = stock.find(stockItem => stockItem.name === cartItem);
            stockProduct.limit -= cart[cartItem];
          })
        })
      }
    }

    (function main() {
      console.log('-------------------------------');

      let stock: Observable<Product[]>;
      const prod1 = {name: "Bamba", price: 5, limit: 10};
      const prod2 = {name: "Bisli", price: 7, limit: 15};
      const prod3 = {name: "Apropo", price: 4, limit: 20};
      const prod4 = {name: "Chitos", price: 2, limit: 5};
      const prod5 = {name: "Doritos", price: 9, limit: 25};
      const products = [prod1, prod2, prod3, prod4, prod5];
      stock = of(products);

      const cart = new Cart();
      products.map(item => cart.addProduct(item));

      console.log('My stock:')
      stock.subscribe(item => console.log(item));
      console.log('My cart:', cart.productsInCart.getValue());

      cart.updateProductAmount(prod1, 5);
      console.log(`After update the amount of ${prod1.name} to 5`);
      console.log('My cart:', cart.productsInCart.getValue());

      console.log(`After remove ${prod2.name} from the cart`);
      cart.removeProduct(prod2);
      console.log('My cart:', cart.productsInCart.getValue());

      console.log('Total price:');
      cart.getTotalPrice(stock);

      console.log('Checkout:');
      cart.checkout(stock);
      console.log('My cart:', cart.productsInCart.getValue());
      console.log('My stock:')
      stock.subscribe(item => console.log(item));

      console.log('-------------------------------');
    })();
  }
}
