import Injector from './injector';
import Injectable from './injectable';
import Inject from './inject';

class Engine {
}

@Injectable()
class Car {
    constructor(public engine:Engine) {
    }
}

class TurboEngine extends Engine {}

@Injectable()
class CarWithInject {
    engine: Engine;
    constructor(param: any, @Inject(TurboEngine) engine: Engine) { this.engine = engine; }
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
});
