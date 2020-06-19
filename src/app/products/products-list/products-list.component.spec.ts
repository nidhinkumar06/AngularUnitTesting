import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsListComponent } from './products-list.component';
import { ProductService } from '../shared/product.service';
import { FileService } from '../../files/shared/file.service';
import { Observable, of } from 'rxjs';
import { Product } from '../shared/product.model';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { DOMHelper } from 'src/testing/dom.helper';
import { Router } from '@angular/router';

describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let dh: DOMHelper<ProductsListComponent>;
  let productServiceMock: any;
  let fileServiceMock: any;

  beforeEach(async(() => {
    productServiceMock = jasmine.createSpyObj('ProductService', ['getProducts']);
    productServiceMock.getProducts.and.returnValue(of([]));
    fileServiceMock = jasmine.createSpyObj('FileService', ['getFileUrl']);
    fileServiceMock.getFileUrl.and.returnValue('');

    TestBed.configureTestingModule({
      declarations: [ProductsListComponent],
      imports: [
        // RouterTestingModule.withRoutes([
        //   { path: 'add', component: DummyComponent }
        // ]) //no need bcoz we have spied the router
        RouterTestingModule
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: FileService, useValue: fileServiceMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
    dh = new DOMHelper(fixture);
    fixture.detectChanges();
  });

  describe('Simple HTML', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should contain an h2 element', () => {
      expect(dh.singleText('h2')).toBe('List all Products');
    });

    it('should have minimum one button on the page', () => {
      expect(dh.count('button')).toBeGreaterThanOrEqual(1);
    });

    it('should have one button with + sign', () => {
      expect(dh.singleText('button')).toBe('+');
    });
  });

  describe('List Products', () => {
    let helper: Helper;
    beforeEach(() => {
      helper = new Helper();
    });

    it('should have only one unordered list', () => {
      expect(dh.count('ul')).toBe(1);
    });

    it('should show no list item when i have no products', () => {
      expect(dh.count('li')).toBe(0);
    });

    it('should show one list item when i have one product', () => {
      component.products = helper.getProducts(1);
      fixture.detectChanges();

      expect(dh.count('li')).toBe(1);
    });

    it('should show 100 list item when i have 100 products', () => {
      component.products = helper.getProducts(100);
      fixture.detectChanges();

      expect(dh.count('li')).toBe(100);
    });

    it('should show 100 delete items one per each list item', () => {
      component.products = helper.getProducts(100);
      fixture.detectChanges();

      expect(dh.countText('button', 'Delete')).toBe(100);
    });

    it('should show one product name and id in the span', () => {
      component.products = helper.getProducts(1);
      fixture.detectChanges();

      const spanItems = fixture.debugElement.queryAll(By.css('span'));

      expect(spanItems.length).toBe(1);
      const span = spanItems[0];
      const spanElement: HTMLSpanElement = span.nativeElement;

      expect(spanElement.textContent).toBe(`${helper.products[0].name} -- ${helper.products[0].id}`);
    });

    it('should show 5 products name and span ', () => {
      component.products = helper.getProducts(5);
      fixture.detectChanges();

      const spanItems = fixture.debugElement.queryAll(By.css('span'));

      expect(spanItems.length).toBe(5);
      for (let i = 0; i < 5; i++) {
        const product = helper.products[i];
        expect(dh.countText('span', `${product.name} -- ${product.id}`)).toBe(1);
      }

    });
  });

  describe('Delete Product', () => {
    let helper: Helper;
    beforeEach(() => {
      helper = new Helper();
    });

    it('should call the delete product once when we click the delete button', () => {
      component.products = helper.getProducts(1);
      fixture.detectChanges();
      spyOn(component, 'deleteProduct');
      dh.clickButton('Delete');
      expect(component.deleteProduct).toHaveBeenCalledTimes(1);
    });

    it('should delete the selected product when delete button is clicked', () => {
      component.products = helper.getProducts(1);
      fixture.detectChanges();
      spyOn(component, 'deleteProduct');
      dh.clickButton('Delete');
      expect(component.deleteProduct).toHaveBeenCalledWith(helper.products[0]);

    });
  });

  describe('Navigation', () => {
    it('should navigate to / before clicking + button', () => {
      const location = TestBed.get(Location);
      expect(location.path()).toBe('');
    });

    it('should native to /add when clicking + button', () => {
      // const location = TestBed.get(Location);
      // const buttonElement = fixture.debugElement.queryAll(By.css('button'));
      // const nativeButtonElement: HTMLButtonElement = buttonElement[0].nativeElement;

      // nativeButtonElement.click();
      // fixture.detectChanges();
      // fixture.whenStable().then(() => {
      //   expect(location.path()).toBe('/add');
      // });

      const router = TestBed.get(Router);
      spyOn(router, 'navigateByUrl');
      dh.clickButton('+');

      expect(router.navigateByUrl).toHaveBeenCalledWith(router.createUrlTree(['/add']), { skipLocationChange: false, replaceUrl: false });
    });
  });

});

// @Component({ template: '' })
// class DummyComponent { } //since we use spy for router we don't need to use the DummyComponent

// class ProductServiceStub {
//   getProducts(): Observable<Product[]> {
//     return of([]);
//   }
// }

// class FileServiceStub { }

// since we have used jasmine spy we don't want to use the file stubs

class Helper {
  products: Product[] = [];

  getProducts(amount: number): Observable<Product[]> {
    for (let i = 0; i < amount; i++) {
      this.products.push({ id: `abc${i}`, name: `item1${i}`, pictureId: 'def' });
    }
    return of(this.products);
  }
}


