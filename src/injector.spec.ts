import Injector from './injector';
import Injectable from './injectable';
import Inject from './inject';
import provide from './provider';

class Engine {
}

@Injectable()
class Car {
    constructor(public engine:Engine) {
    }
}

class TurboEngine extends Engine {
}

@Injectable()
class CarWithInject {
    engine:Engine;

    constructor(param:any, @Inject(TurboEngine) engine:Engine) {
        this.engine = engine;
    }
}

function createInjector(providers) {
    return Injector.resolve(providers);
}

describe('Injector', () => {
    it('should instantiate a class without dependencies', () => {
        const injector = createInjector([Engine]);
        const engine = injector.get(Engine);

        expect(engine instanceof Engine).toBe(true);
    });

    it('should resolve dependencies based on type information', () => {
        const injector = createInjector([Engine, Car]);
        const car = injector.get(Car);

        expect(car instanceof Car).toBe(true);
        expect(car.engine instanceof Engine).toBe(true);
    });

    it('should resolve dependencies based on @Inject annotation', () => {
        const injector = createInjector([TurboEngine, Engine, CarWithInject]);
        const car = injector.get(CarWithInject);

        expect(car instanceof CarWithInject).toBe(true);
        expect(car.engine instanceof TurboEngine).toBe(true);
    });

    it('should cache instances', () => {
        const injector = createInjector([Engine]);

        const e1 = injector.get(Engine);
        const e2 = injector.get(Engine);

        expect(e1).toBe(e2);
    });

    it('should provide to a value', () => {
        const injector = createInjector([provide(Engine, {useValue: "fake engine"})]);

        const engine = injector.get(Engine);
        expect(engine).toEqual("fake engine");
    });

    it('should accept strings as a key for providers', () => {
        const injector = createInjector([provide('myValue', {useValue: "42"})]);

        const value = injector.get('myValue');
        expect(value).toEqual("42");
    });
});
