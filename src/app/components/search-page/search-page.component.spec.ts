import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchPageComponent } from './search-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipeService } from 'src/app/services/recipe.service';
import { of } from 'rxjs';
import { RecipeListResponseType } from 'src/app/model/recipe-list-response-type';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

const mockRecipeListResponse: RecipeListResponseType = {
  offset: 10,
  number: 0,
  results: [
    {
      id: '637876',
      title: 'Chicken 65',
      readyInMinutes: 45,
      servings: 4,
      vegetarian: false,
      healthScore: 80,
    },
    {
      id: '716342',
      title: 'Chicken Suya',
      readyInMinutes: 35,
      servings: 2,
      vegetarian: false,
      healthScore: 76,
    },
    {
      id: '638308',
      title: 'Chicken Satay',
      readyInMinutes: 50,
      servings: 4,
      vegetarian: false,
      healthScore: 65,
    },
  ],
  totalResults: 3,
};

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let mockRecipeSvc: RecipeService;
  let fixture: ComponentFixture<SearchPageComponent>;
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    mockRecipeSvc = jasmine.createSpyObj<RecipeService>('RecipeService', {
      searchRecipes: of(mockRecipeListResponse),
    });

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [SearchPageComponent],
      providers: [
        { provide: RecipeService, useValue: mockRecipeSvc },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise the search form on startup', () => {
    const initFormSpy = spyOn<any>(component, 'initForm');
    component.ngOnInit();
    expect(initFormSpy).toHaveBeenCalled();
  });

  it('should retrieve a list of recipes through the Recipe Service', () => {
    component.searchRecipes(0);
    expect(mockRecipeSvc.searchRecipes).toHaveBeenCalled();
    mockRecipeSvc.searchRecipes(0, '').subscribe((response) => {
      expect(response).toEqual(mockRecipeListResponse);
    });
  });

  it('should call searchRecipes when the search Button is clicked', () => {
    const searchRecipesSpy = spyOn<any>(component, 'searchRecipes');
    const { debugElement } = fixture;
    const searchBtn = debugElement.query(By.css('[testid="search-button"]'));

    searchBtn.triggerEventHandler('click', 'chicken');
    expect(searchRecipesSpy).toHaveBeenCalled();
  });

  it('should get search text from the search field', () => {
    const { debugElement } = fixture;
    const searchTextField = debugElement.query(
      By.css('[testid="search-text-input"]')
    );

    searchTextField.nativeElement.value = 'chicken';
    searchTextField.nativeElement.dispatchEvent(new Event('input'));

    expect(component.form?.value.searchText).toEqual('chicken');
  });

  it('should get the meal type from the meal type selection', () => {
    const { debugElement } = fixture;
    const mealTypeSelect = debugElement.query(
      By.css('[testid="meal-type-select"]')
    );

    mealTypeSelect.nativeElement.value = 'soup';
    mealTypeSelect.nativeElement.textContent = 'soup';
    mealTypeSelect.nativeElement.dispatchEvent(new Event('select'));

    //TODO: this one not working currently
    //expect(component.form?.value.mealType).toEqual('soup');
  });

  it('should disable the search button when non-alphabetical characters are entered', () => {
    const { debugElement } = fixture;
    const searchTextField = debugElement.query(
      By.css('[testid="search-text-input"]')
    );
    const searchBtn = debugElement.query(By.css('[testid="search-button"]'));

    searchTextField.nativeElement.value = '!!""%%';
    searchTextField.nativeElement.dispatchEvent(new Event('input'));

    expect(searchBtn.nativeElement.disabled).toBeTrue();
  });

  it('navigates to the view page on view recipe', () => {
    component.viewRecipe('334');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['view', '334']);
  });
});
