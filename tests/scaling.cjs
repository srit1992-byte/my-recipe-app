const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:8000');
    const recipe={id:'scaling-test',title:'Chicken dinner',category:'Dinner',minutes:30,servings:3,ingredients:['300 g chicken','150 g rice','1/2 cup stock','1 1/2 tbsp oil','0.5 tsp paprika','1 tsp salt to taste','Pepper to taste','0 g garnish','1/0 cup invalid'],steps:['Cook until done.'],favorite:false};
    const unmeasured={...recipe,id:'unmeasured',title:'Seasoning',ingredients:['Salt to taste','Pepper']};
    await page.evaluate(recipes=>localStorage.setItem('my-recipe-book-v1',JSON.stringify(recipes)),[recipe,unmeasured]);await page.reload();
    const original=await page.evaluate(()=>localStorage.getItem('my-recipe-book-v1'));
    await page.getByRole('button',{name:'Chicken dinner',exact:true}).click();
    assert.equal(await page.locator('#scale-ingredient option').count(),5);
    assert.equal(await page.locator('#original-quantity').innerText(),'Original: 300 g chicken');
    await page.getByLabel('Quantity available').fill('500');
    const expected=['500 g chicken','250 g rice','0.833333 cup stock','2.5 tbsp oil','0.833333 tsp paprika','1 tsp salt to taste','Pepper to taste','0 g garnish','1/0 cup invalid'].join('\n');
    assert.equal(await page.locator('#scaled-ingredients').innerText(),expected);
    assert.match(await page.locator('.scaling').innerText(),/Cooking times do not scale proportionally/);
    await page.getByRole('button',{name:'Add to shopping list',exact:true}).click();
    const shopping=await page.evaluate(()=>JSON.parse(localStorage.getItem('my-recipe-book-v1-shopping')));
    assert.deepEqual(shopping.map(x=>x.text),expected.split('\n'));
    await page.getByLabel('Quantity available').fill('600');
    assert.match(await page.locator('#scaled-ingredients').innerText(),/^600 g chicken\n300 g rice/);
    assert.equal(await page.getByLabel('Quantity available').inputValue(),'600');
    await page.getByLabel('Scale by ingredient').selectOption('1');
    assert.equal(await page.locator('#original-quantity').innerText(),'Original: 150 g rice');
    assert.equal(await page.getByLabel('Quantity available').inputValue(),'300');
    await page.getByLabel('Quantity available').fill('225');
    assert.match(await page.locator('#scaled-ingredients').innerText(),/^450 g chicken\n225 g rice/);
    for(const value of ['0','-1','']){
      await page.getByLabel('Quantity available').fill(value);
      assert.equal(await page.getByRole('button',{name:'Add to shopping list',exact:true}).isDisabled(),true);
      assert.match(await page.locator('#scaled-ingredients').innerText(),/^450 g chicken/);
    }
    await page.getByRole('button',{name:'Reset',exact:true}).click();
    assert.equal(await page.locator('#scaled-ingredients').innerText(),recipe.ingredients.join('\n'));
    assert.equal(await page.getByRole('button',{name:'Add to shopping list',exact:true}).isEnabled(),true);
    await page.getByLabel('Scale by ingredient').selectOption('2');
    await page.getByLabel('Quantity available').fill('1');
    assert.match(await page.locator('#scaled-ingredients').innerText(),/^600 g chicken/);
    await page.getByLabel('Quantity available').fill('0');
    assert.equal(await page.getByRole('button',{name:'Add to shopping list',exact:true}).isDisabled(),true);
    await page.getByLabel('Quantity available').fill('0.25');
    assert.match(await page.locator('#scaled-ingredients').innerText(),/^150 g chicken/);
    assert.equal(await page.evaluate(()=>localStorage.getItem('my-recipe-book-v1')),original);
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('#detail').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    await page.getByRole('button',{name:'Close recipe',exact:true}).click();
    await page.getByRole('button',{name:'Chicken dinner',exact:true}).click();
    await page.getByRole('button',{name:'Close recipe',exact:true}).click();
    await page.getByRole('button',{name:'Seasoning',exact:true}).click();
    assert.equal(await page.getByLabel('Quantity available').isDisabled(),true);
    assert.equal(await page.getByLabel('Scale by ingredient').isDisabled(),true);
    assert.equal(await page.locator('#scaled-ingredients').innerText(),'Salt to taste\nPepper');
    assert.deepEqual(errors,[]);
    console.log('PASS: ingredient ratios, original quantity, switching ingredients without compounding, fraction/decimal quantities, to-taste exclusions, invalid input, reset, scaled shopping list, unchanged saved originals, reopening, unmeasured recipes, mobile layout.');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
