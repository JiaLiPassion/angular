/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
const fakeAsyncTestModule = _Zone && _Zone[_Zone.__symbol__('fakeAsyncTest')];

const fakeAsyncTestModuleNotLoadedErrorMessage =
    `zone-testing.js is needed for the fakeAsync() test helper but could not be found.
        Please make sure that your environment includes zone.js/dist/zone-testing.js`;

/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
export function resetFakeAsyncZone(): void {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.resetFakeAsyncZone();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

interface FakeAsync {
  /**
   * Wraps a function to be executed in the fakeAsync zone:
   * - microtasks are manually executed by calling `flushMicrotasks()`,
   * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
   *
   * If there are any pending timers at the end of the function, an exception will be thrown.
   *
   * Can be used to wrap inject() calls.
   *
   * @usageNotes
   * ### Example
   *
   * {@example core/testing/ts/fake_async.ts region='basic'}
   *
   * @param fn
   * @returns The function wrapped to be executed in the fakeAsync zone
   *
   * @publicApi
   */
  (fn: Function): (...args: any[]) => any;

  /**
   * Wrap the `fakeAsync()` function with the `beforeEach()/afterEach()` hooks.
   *
   * Given `AppComponent`:
   *
   * @Component({...})
   * export class AppComponent {
   *   timerId: number;
   *   ngOnInit() {
   *     this.timerId = setTimeout(() => {});
   *   }
   *
   *   ngOnDestroy() {
   *     clearTimeout(this.timerId);
   *   }
   * }
   *
   * We can write test cases with `fakeAsync()` in this way.
   *
   * describe('AppComponent test', () => {
   *   let fixture: ComponentFixture<AppComponent>;
   *   beforeEach(() => {
   *     ...
   *     fixture = TestBed.createComponent(AppComponent);
   *   });
   *
   *   it('test case1', fakeAsync(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *     fixture.destroy();
   *   }));
   *
   *   it('test case2', fakeAsync(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *     fixture.destroy();
   *   }));
   * });
   *
   * Here we need to call `fixture.destroy()` inside each test, since each `it()` is in its own
   * `fakeAsync()` scope and we can only clean up the async tasks (such as `setTimeout`,
   * `setInterval`) created in that `fakeAsync()`. With the hooks, we can write the case in this
   * way.
   *
   * describe('AppComponent test', () => {
   *   let fixture: ComponentFixture<AppComponent>;
   *   const fakeAsyncWithFixture = fakeAsync.wrap({
   *     beforeEach: () => fixture = TestBed.createComponent(AppComponent);
   *     afterEach: () => fixture.destroy();
   *   });
   *
   *   it('test case1', fakeAsyncWithFixture(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *   }));
   *
   *   it('test case2', fakeAsyncWithFixture(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *   }));
   * });
   *
   * Also the `wrap()` function support nesting.
   *
   * describe('AppComponent test', () => {
   *   let fixture: ComponentFixture<AppComponent>;
   *
   *   const fakeAsyncWithFixture = fakeAsync.wrap({
   *     beforeEach: () => {
   *       fixture = TestBed.createComponent(AppComponent);
   *       fixture.detectChanges();
   *     }
   *     afterEach: () => fixture.destroy();
   *   });
   *
   *   it('test case1', fakeAsyncWithFixture(() => {
   *     // do some test with fixture
   *   }));
   *
   *   it('test case2', fakeAsyncWithFixture(() => {
   *     // do some test with fixture
   *   }));
   *
   *   describe('AppComponent sub test: auth test', () => {
   *     const fakeAsyncNested = fakeAsyncWithFixture.wrap({
   *       beforeEach: () => fixture.componentInstance.login(),
   *       afterEach: () => fixture.componentInstance.logout();
   *     });
   *
   *     it('should show user info', () => {
   *       // do some test with fixture with authenticated user.
   *     });
   *   });
   * });
   *
   * @param hooks, the object with the `beforeEach()` and the `afterEach()` hook function.
   * @returns The fakeAsync function wrapped with the specified hooks.
   */
  wrap(hooks: {beforeEach?: () => void, afterEach?: () => void}): FakeAsync;
}

/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * Can be used to wrap inject() calls.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns The function wrapped to be executed in the fakeAsync zone
 *
 * @publicApi
 */
export const fakeAsync = function(fn: Function): (...args: any[]) => any {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.fakeAsync(fn);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
} as FakeAsync;

fakeAsync.wrap = function(hooks: {beforeEach?: () => void, afterEach?: () => void}): FakeAsync {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.fakeAsync.wrap(hooks);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
};

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @param millis, the number of millisecond to advance the virtual timer
 * @param tickOptions, the options of tick with a flag called
 * processNewMacroTasksSynchronously, whether to invoke the new macroTasks, by default is
 * false, means the new macroTasks will be invoked
 *
 * For example,
 *
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick();
 *   expect(nestedTimeoutInvoked).toBe(true);
 * }));
 *
 * in this case, we have a nested timeout (new macroTask), when we tick, both the
 * funcWithNestedTimeout and the nested timeout both will be invoked.
 *
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick(0, {processNewMacroTasksSynchronously: false});
 *   expect(nestedTimeoutInvoked).toBe(false);
 * }));
 *
 * if we pass the tickOptions with processNewMacroTasksSynchronously to be false, the nested timeout
 * will not be invoked.
 *
 *
 * @publicApi
 */
export function tick(
    millis: number = 0, tickOptions: {processNewMacroTasksSynchronously: boolean} = {
      processNewMacroTasksSynchronously: true
    }): void {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.tick(millis, tickOptions);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
 * draining the macrotask queue until it is empty. The returned value is the milliseconds
 * of time that would have been elapsed.
 *
 * @param maxTurns
 * @returns The simulated time elapsed, in millis.
 *
 * @publicApi
 */
export function flush(maxTurns?: number): number {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.flush(maxTurns);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
export function discardPeriodicTasks(): void {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.discardPeriodicTasks();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Flush any pending microtasks.
 *
 * @publicApi
 */
export function flushMicrotasks(): void {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.flushMicrotasks();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
