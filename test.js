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
const suite = new Benchmark.Suite();

// Add tests
suite
  .add('kr-observable create observable object', () => {
    kr.makeObservable({ a: ++krCreateCount })
  })
  .add('MobX create observable object', () => {
    mobx.makeAutoObservable({ a: ++mobxCreateCount })
  })
  .add('Vue create observable object', () => {
    vue.reactive({ a: ++vueCreateCount })
  })

  .add('kr-observable update & read without observe', () => {
    state.updateA()
    krReadCount = state.a;
  })
  .add('MobX update & read without observe', () => {
    mobxState.updateA();
    mobxReadCount = mobxState.a;
  })
  .add('Vue update & read without observe', () => {
    vueState.updateA()
    vueReadCount = vueState.a;
  })

  .add('kr-observable update & run reaction', () => {
    state.updateB()
  })
  .add('MobX update & run reaction', () => {
    mobxState.updateB()
  })
  .add('Vue update & run reaction', () => {
    vueState.updateB()
  })

  .add('kr-observable update 2 props & run reaction', () => {
    krs.update()
  })
  .add('MobX update 2 props & run reaction', () => {
    mbs.update()
  })
  .add('Vue update 2 props & run reaction', () => {
    vs.update()
  })


  .add('kr-observable update unobserved without read', () => {
    state.updateC()
  })
  .add('MobX update unobserved without read', () => {
    mobxState.updateC()
  })
  .add('Vue update unobserved without read', () => {
    vueState.updateC()
  })

  // Event listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log(`kr, mobx && vue reads count`, krReadCount, mobxReadCount, vueReadCount);
    console.log(`kr, mobx && vue reactions count`, krCount, mobxCount, vueCount)
  })
  .run({ async: true });