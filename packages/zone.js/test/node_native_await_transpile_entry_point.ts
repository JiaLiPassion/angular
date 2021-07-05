/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be loaded before zone loads, so that zone can detect WTF.
// Setup tests for Zone without microtask support
import '../lib/zone';
import '../lib/common/promise';
import '../lib/common/to-string';
import '../lib/node/node';
