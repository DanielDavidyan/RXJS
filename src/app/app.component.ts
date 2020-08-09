import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  ngOnInit() {
    interface Product {
      name: string;
      price: number;
      limit: number;
      description?: string;
      img?: string;
    }

    class Cart {
      productsInCart: BehaviorSubject<Record<string, number>>;

      constructor() {
        this.productsInCart = new BehaviorSubject<Record<string, number>>({});
      }

      public addProduct(product: Product) {
        if (product.limit > 0) {
          let cart = this.productsInCart.getValue();
          cart[product.name] = 1;
          this.productsInCart.next(cart);
        } else
          console.log("Sold out!");
      }

      public updateProductAmount(product: Product, amount: number) {
        if (product.limit >= amount) {
          let cart = this.productsInCart.getValue();
          cart[product.name] = amount;
          this.productsInCart.next(cart);
        } else
          console.log(`You can buy maximum ${product.limit} ${product.name}`);
      }

      public removeProduct(product: Product) {
        let cart = this.productsInCart.getValue();
        delete cart[product.name];
        this.productsInCart.next(cart);
      }

      public getTotalPrice(stock: Observable<Product[]>) {
        let totalPrice = 0;
        combineLatest([this.productsInCart, stock]).subscribe(([cart, stock]) => {
          const ProductsCart: string[] = Object.keys(cart);
          totalPrice = ProductsCart.reduce((total, item) =>
            total + (cart[item] * stock.find((prod) => prod.name === item).price)
            , 0);
        })
        console.log(totalPrice);
      }

      public checkout(stock: Observable<Product[]>) {
        combineLatest([this.productsInCart, stock]).subscribe(([cart, stock]) => {
          const ProductsCart: string[] = Object.keys(cart);
          ProductsCart.map(cartItem => {
            const stockProduct = stock.find(stockItem => stockItem.name === cartItem);
            stockProduct.limit -= cart[cartItem];
          })
        })
      }
    }

    (function main() {
      let stock: Observable<Product[]>;
      const prod1 = {name: "Bamba", price: 5, limit: 10};
      const prod2 = {name: "Bisli", price: 7, limit: 15};
      const prod3 = {name: "Apropo", price: 4, limit: 20};
      const prod4 = {name: "Chitos", price: 2, limit: 5};
      const prod5 = {name: "Doritos", price: 9, limit: 25};
      const products = [prod1, prod2, prod3, prod4, prod5];
      stock = of(products);
      const cart = new Cart();
      products.map(products => cart.addProduct(products));

      stock.subscribe(products => console.log('My stock:', products));
      console.log('My cart:', cart.productsInCart.getValue());

      cart.updateProductAmount(prod1, 5)
      cart.removeProduct(prod2);
      cart.getTotalPrice(stock);
      cart.checkout(stock);
    })();
  }
}
