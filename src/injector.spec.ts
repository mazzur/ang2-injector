import Injector from './injector';
import Injectable from './injectable';
import Optional from './optional';
import Inject from './inject';
import provide from './provider';
import forwardRef from './forwardRef';

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

@Injectable()
class SportsCar extends Car {
    engine:Engine;

    constructor(engine:Engine) {
        super(engine);
    }
}

@Injectable()
class CarWithOptionalEngine {
    engine;

    constructor(@Optional() engine:Engine) {
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

    it('should provide to a factory', () => {
        function sportsCarFactory(e) {
            return new SportsCar(e);
        }

        const injector = createInjector([Engine, provide(Car, {
            useFactory: sportsCarFactory,
            deps: [Engine]
        })]);

        const car = injector.get(Car);
        expect(car instanceof SportsCar).toBe(true);
        expect(car.engine instanceof Engine).toBe(true);
    });

    it('should supporting provider to null', () => {
        const injector = createInjector([provide(Engine, {useValue: null})]);
        const engine = injector.get(Engine);
        expect(engine).toBeNull();
    });

    it('should provide to an alias', () => {
        const injector = createInjector([
            Engine,
            provide(SportsCar, {useClass: SportsCar}),
            provide(Car, {useExisting: SportsCar})
        ]);

        const car = injector.get(Car);
        const sportsCar = injector.get(SportsCar);
        expect(car instanceof SportsCar).toBe(true);
        expect(car).toBe(sportsCar);
    });

    it('should support multiProviders', () => {
        const injector = createInjector([
            Engine,
            {provide: Car, useClass: SportsCar, multi: true},
            {provide: Car, useClass: CarWithOptionalEngine, multi: true}
        ]);

        const cars = injector.get(Car);
        expect(cars.length).toEqual(2);
        expect(cars[0] instanceof SportsCar).toBe(true);
        expect(cars[1] instanceof CarWithOptionalEngine).toBe(true);
    });

    it('should support multiProviders that are created using useExisting', () => {
        const injector = createInjector([
            Engine,
            SportsCar,
            {provide: Car, useExisting: SportsCar, multi: true}
        ]);

        const cars = injector.get(Car);
        expect(cars.length).toEqual(1);
        expect(cars[0]).toBe(injector.get(SportsCar));
    });

    it('should handle forwardRef in useExisting', () => {
        const injector = createInjector([
            provide('originalService', {useClass: forwardRef(() => Service)}),
            provide('aliasedService', {useExisting: <any>forwardRef(() => 'originalService')})
        ]);

        class Service {
        }
        expect(injector.get('aliasedService') instanceof Service).toBe(true);
    });

    it('should support optional dependencies', () => {
        const injector = createInjector([CarWithOptionalEngine]);

        const car = injector.get(CarWithOptionalEngine);
        expect(car.engine).toEqual(null);
    });

    it("should flatten passed-in providers", () => {
        const injector = createInjector([[[Engine, Car]]]);

        const car = injector.get(Car);
        expect(car instanceof Car).toBe(true);
    });

    it("should use the last provider when there are multiple providers for same token", () => {
        const injector = createInjector(
            [provide(Engine, {useClass: Engine}), provide(Engine, {useClass: TurboEngine})]);

        expect(injector.get(Engine) instanceof TurboEngine).toBe(true);
    });

    it('should use non-type tokens', () => {
        const injector = createInjector([provide('token', {useValue: 'value'})]);

        expect(injector.get('token')).toEqual('value');
    });

    it('should provide itself', () => {
        const parent = createInjector([]);
        const child = parent.resolveAndCreateChild([]);

        expect(child.get(Injector)).toBe(child);
    });
});
