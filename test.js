import Benchmark from 'benchmark'
import * as mobx from 'mobx'
import * as kr from 'kr-observable'
import * as vue from 'vue'

// MobX setup
const mobxState = mobx.makeAutoObservable({
  a: 0,
  b: 0,
  c: 0,
  updateA() {
    this.a += 1;
  },
  updateB() {
    this.b += 1;
  },
  updateC() {
    this.c += 1;
  }
});
let mobxCount = 0;
mobx.autorun(() => {
  mobxCount = mobxState.b;
});

// Vue setup
const vueState = vue.reactive({
  a: 0,
  b: 0,
  c: 0,
  updateA() {
    this.a += 1;
  },
  updateB() {
    this.b += 1;
  },
  updateC() {
    this.c += 1;
  }
});
let vueCount = 0;
vue.watchEffect(() => {
  vueCount = vueState.b;
});

// kr-observable setup
const state = kr.makeObservable({
  a: 0,
  b: 0,
  c: 0,
  updateA() {
    this.a += 1;
  },
  updateB() {
    this.b += 1;
  },
  updateC() {
    this.c += 1;
  }
});

let krCount = 0;
kr.autorun( () => {
  krCount = state.b;
});

let vueCreateCount = 0;
let mobxCreateCount = 0;
let krCreateCount = 0;

let vueReadCount = 0;
let mobxReadCount = 0;
let krReadCount = 0;

let krc = 0
const krs = kr.makeObservable({
  a: 0,
  b: 0,
  update() {
    this.a += 1;
    this.b += 1;
  }
})
kr.autorun( () => {
  krc = krs.a + krs.b
})

let mbc = 0;
const mbs = mobx.makeAutoObservable({
  a: 0,
  b: 0,
  update() {
    this.a += 1;
    this.b += 1;
  }
})
mobx.autorun( () => {
  mbc = mbs.a + mbs.b
})

let vsc = 0;
const vs = vue.reactive({
  a: 0,
  b: 0,
  update() {
    this.a += 1;
    this.b += 1;
  }
})
vue.watchEffect( () => {
  vsc = vs.a + vs.b
})

// Benchmark Suite
const suite1 = new Benchmark.Suite();

// Add tests
suite1
  .add('[Observable] – create observable object_________', () => {
    kr.makeObservable({ a: ++krCreateCount })
  })
  .add('[MobX......] – create observable object_________', () => {
    mobx.makeAutoObservable({ a: ++mobxCreateCount })
  })
  .add('[Vue.......] – create observable object_________', () => {
    vue.reactive({ a: ++vueCreateCount })
  })
  .on('cycle', (event) => console.log(String(event.target)))

const suite2 = new Benchmark.Suite();
suite2
  .add('[Observable] – update unobserved without read___', () => {
    state.updateC()
  })
  .add('[MobX......] – update unobserved without read___', () => {
    mobxState.updateC()
  })
  .add('[Vue.......] – update unobserved without read___', () => {
    vueState.updateC()
  })
  .on('cycle', (event) => console.log(String(event.target)))


const suite3 = new Benchmark.Suite();
suite3
  .add('[Observable] – update & read without observe____', () => {
    state.updateA()
    krReadCount = state.a;
  })
  .add('[MobX......] – update & read without observe____', () => {
    mobxState.updateA();
    mobxReadCount = mobxState.a;
  })
  .add('[Vue.......] – update & read without observe____', () => {
    vueState.updateA()
    vueReadCount = vueState.a;
  })
  .on('cycle', (event) => console.log(String(event.target)))

const suite4 = new Benchmark.Suite();
suite4
  .add('[Observable] – update & run reaction____________', () => {
    state.updateB()
  })
  .add('[MobX......] – update & run reaction____________', () => {
    mobxState.updateB()
  })
  .add('[Vue.......] – update & run reaction____________', () => {
    vueState.updateB()
  })
  .on('cycle', (event) => console.log(String(event.target)))


const suite5 = new Benchmark.Suite();
suite5
  .add('[Observable] – update 2 props & run reaction____', () => {
    krs.update()
  })
  .add('[MobX......] – update 2 props & run reaction____', () => {
    mbs.update()
  })
  .add('[Vue.......] – update 2 props & run reaction____', () => {
    vs.update()
  })
  .on('cycle', (event) => console.log(String(event.target)))


const suite6 = new Benchmark.Suite();
suite6
  .add('[Observable] – create, update and observe 1 prop', async () => {
    let a = kr.makeObservable({ a: 0, update() { this.a += 1; } });
    let count = 0;
    return await new Promise(resolve => {
      let dispose;
      dispose = kr.autorun(() => {
        count = a.a;
        if (count === 1) {
          dispose();
          resolve();
        }
      });
      a.update();
    })
  })
  .add('[MobX......] – create, update and observe 1 prop', async () => {
    let a = mobx.makeAutoObservable({
      a: 0,
      update() {
        this.a += 1;
      }
    });
    let count = 0;
    return await new Promise(resolve => {
      let dispose
      dispose =mobx.autorun(() => {
        count = a.a;
        if (count === 1) {
          dispose();
          resolve();
        }
      });
      a.update();
    })
  })
  .add('[Vue.......] – create, update and observe 1 prop', async () => {
    let a = vue.reactive({
      a: 0,
      update() {
        this.a += 1;
      }
    });
    let count = 0;
    return await new Promise(resolve => {
      let dispose;
      dispose = vue.watchEffect(() => {
        count = a.a;
        if (count === 1) {
          dispose();
          resolve();
        }
      });
      a.update();
    })
  })
  .on('cycle', (event) => console.log(String(event.target)))


const suite7 = new Benchmark.Suite();
suite7
  .add('[Observable] – create, update and observe 2 prop', () => {
    let a = kr.makeObservable({
      a: 0,
      b: 0,
      update() {
        this.a += 1;
        this.b += 1;
      }
    });
    let count = 0;
    return new Promise(resolve => {
      let dispose;
      dispose = kr.autorun(() => {
        count = a.a + a.b;
        if (count === 2) {
          dispose();
          resolve();
        }
      });
      a.update();
    })
  })
  .add('[MobX......] – create, update and observe 2 prop', async () => {
    let a = mobx.makeAutoObservable({
      a: 0,
      b: 0,
      update() {
        this.a += 1;
        this.b += 1;
      }
    });
    let count = 0;
    return await new Promise(resolve => {
      let dispose;
      dispose = mobx.autorun(() => {
        count = a.a + a.b;
        if (count === 2) {
          dispose();
          resolve();
        }
      });
      a.update();
    })
  })
  .add('[Vue.......] – create, update and observe 2 prop', async () => {
    let a = vue.reactive({
      a: 0,
      b: 0,
      update() {
        this.a += 1;
        this.b += 1;
      }
    });
    let count = 0;
    return await new Promise(resolve => {
      let dispose;
      dispose = vue.watchEffect(() => {
        count = a.a + a.b;
        if (count === 2) {
          dispose();
          resolve();
        }
      });
      a.update();
    })
  })
  .on('cycle', (event) => console.log(String(event.target)))


const pattern = /(Fastest is \[[^\]]*\])/;

suite1
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
    suite2.run({ async: true })
  })
  .run({ async: true });

suite2
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
    suite3.run({ async: true })
  })

suite3
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
    suite4.run({ async: true })
  })

suite4
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
    suite5.run({ async: true })
  })

suite5
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
    suite6.run({ async: true })
  })

suite6
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
    suite7.run({ async: true })
  })

suite7
  .on('complete', function() {
    const res = 'Fastest is ' + this.filter('fastest').map('name')
    console.log(res.match(pattern)[0]);
  })