const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

let browser;
let context;
let page;

let user = {
    email: "",
    password: "123456",
    confirmPass: "123456",
};

let droneName = "";

describe("e2e tests", () => {

    beforeAll(async () => {
        browser = await chromium.launch({ headless: false });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });

    // AUTHENTICATION
    
    describe("authentication", () => {

        test("register with valid data", async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 10000);
            user.email = `user_${random}@abv.bg`;

            let form = page.locator('form');
            let inputs = form.locator('input');

            await inputs.nth(0).fill(user.email);
            await inputs.nth(1).fill(user.password);
            await inputs.nth(2).fill(user.confirmPass);

            await form.locator('[type="submit"]').click();

            await expect(page).toHaveURL(host + '/');
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
        });

        test("login with valid data", async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');

            let form = page.locator('form');
            let inputs = form.locator('input');

            await inputs.nth(0).fill(user.email);
            await inputs.nth(1).fill(user.password);

            await form.locator('[type="submit"]').click();

            await expect(page).toHaveURL(host + '/');
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
        });

        test("logout", async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');

            let form = page.locator('form');
            let inputs = form.locator('input');

            await inputs.nth(0).fill(user.email);
            await inputs.nth(1).fill(user.password);
            await form.locator('[type="submit"]').click();

            await page.click('nav >> text=Logout');
            await page.waitForSelector('nav >> text=Login');

            await expect(page).toHaveURL(host + '/');
        });
    });
    
    // NAVBAR
   
    describe("navbar", () => {

       test("logged user navigation", async () => {
            await page.goto(host);

            await page.click('text=Login');
            await page.waitForSelector('form');

            await page.locator('input[name="email"]').fill(user.email);
            await page.locator('input[name="password"]').fill(user.password);
            await page.click('[type="submit"]');

            await expect(page.locator('nav >> text=Marketplace')).toBeVisible();
            await expect(page.locator('nav >> text=Sell')).toBeVisible();
            await expect(page.locator('nav >> text=Logout')).toBeVisible();

            await expect(page.locator('nav >> text=Login')).toBeHidden();
            await expect(page.locator('nav >> text=Register')).toBeHidden();
        });

        test("guest user navigation", async () => {
            await page.goto(host);

            await expect(page.locator('nav >> text=Marketplace')).toBeVisible();
            await expect(page.locator('nav >> text=Login')).toBeVisible();
            await expect(page.locator('nav >> text=Register')).toBeVisible();

            await expect(page.locator('nav >> text=Sell')).toBeHidden();
            await expect(page.locator('nav >> text=Logout')).toBeHidden();
        });
    });

    
    // CRUD
   
    describe("CRUD", () => {

        beforeEach(async () => {
            await page.goto(host);

            await page.click('text=Login');
            await page.waitForSelector('form');

            await page.locator('input[name="email"]').fill(user.email);
            await page.locator('input[name="password"]').fill(user.password);
            await page.click('[type="submit"]');
        });

        test("create a drone", async () => {
            await page.click('text=Sell');
            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 10000);
            droneName = `Drone_${random}`;

            await page.locator('input[name="model"], #model').first().fill(droneName);
            await page.locator('input[name="imageUrl"], #imageUrl').first().fill('https://topdigital.bg/cms/wp-content/uploads/2021/08/hq-xmart-sg900-drone-01.jpg');
            await page.locator('input[name="price"], #price').first().fill('1500');
            await page.locator('input[name="weight"], #weight').first().fill('1200');
            await page.locator('input[name="phone"], #phone').first().fill('0888888888');
            await page.locator('input[name="condition"], #condition').first().fill('New');
            await page.locator('textarea[name="description"], input[name="description"], #description').first().fill('Test description');

            await page.click('[type="submit"]');

            await expect(page).toHaveURL(host + '/catalog');
            await expect(page.locator(`text=${droneName}`)).toBeVisible();
        });

        test("edit a drone", async () => {
            await page.click('text=Marketplace');
            await expect(page).toHaveURL(host + '/catalog');

            await page.locator('text=Details').first().click();
            await page.click('text=Edit');
            await page.waitForSelector('form');

            let editedName = 'Edited Drone Model';
            await page.locator('input[name="model"], #model').first().fill(editedName);

            await page.click('[type="submit"]');

            await expect(page.locator(`text=${editedName}`)).toBeVisible();
        });

        test('delete a drone', async () => {
            await page.click('text=Marketplace');
            await page.locator('text=Details').first().click();

            page.on('dialog', dialog => dialog.accept());

            await page.click('text=Delete');

            await expect(page).toHaveURL(host + '/catalog');
            await expect(page.locator(`text=${droneName}`)).toHaveCount(0);
        });
    });
});
