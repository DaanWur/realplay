/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-fastify");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const bullmq_1 = __webpack_require__(6);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
const redis_1 = __webpack_require__(9);
const prisma_1 = __webpack_require__(13);
const tournaments_module_1 = __webpack_require__(18);
const bets_module_1 = __webpack_require__(24);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            redis_1.RedisModule,
            prisma_1.PrismaModule,
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    connection: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6379),
                    },
                }),
            }),
            tournaments_module_1.TournamentsModule,
            bets_module_1.BetsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/bullmq");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(8);
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(2);
let AppService = class AppService {
    getHello() {
        return 'Hello World!';
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(10), exports);
__exportStar(__webpack_require__(11), exports);


/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisModule = void 0;
const common_1 = __webpack_require__(2);
const redis_service_1 = __webpack_require__(11);
const config_1 = __webpack_require__(5);
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [redis_service_1.RedisService],
        exports: [redis_service_1.RedisService],
    })
], RedisModule);


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisService = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const ioredis_1 = __webpack_require__(12);
let RedisService = class RedisService extends ioredis_1.Redis {
    configService;
    constructor(configService) {
        super({
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            lazyConnect: true,
        });
        this.configService = configService;
    }
    onModuleDestroy() {
        this.disconnect();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], RedisService);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("ioredis");

/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(14), exports);
__exportStar(__webpack_require__(15), exports);


/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(2);
const prisma_service_1 = __webpack_require__(15);
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(2);
const client_1 = __webpack_require__(16);
const adapter_pg_1 = __webpack_require__(17);
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("@prisma/adapter-pg");

/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TournamentsModule = void 0;
const common_1 = __webpack_require__(2);
const bullmq_1 = __webpack_require__(6);
const tournaments_service_1 = __webpack_require__(19);
const tournaments_controller_1 = __webpack_require__(21);
let TournamentsModule = class TournamentsModule {
};
exports.TournamentsModule = TournamentsModule;
exports.TournamentsModule = TournamentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'tournament-snapshot',
            }),
        ],
        providers: [tournaments_service_1.TournamentsService],
        controllers: [tournaments_controller_1.TournamentsController],
    })
], TournamentsModule);


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TournamentsService = void 0;
const common_1 = __webpack_require__(2);
const prisma_1 = __webpack_require__(13);
const bullmq_1 = __webpack_require__(6);
const bullmq_2 = __webpack_require__(20);
const redis_1 = __webpack_require__(9);
let TournamentsService = class TournamentsService {
    prisma;
    redis;
    snapshotQueue;
    constructor(prisma, redis, snapshotQueue) {
        this.prisma = prisma;
        this.redis = redis;
        this.snapshotQueue = snapshotQueue;
    }
    async create(dto) {
        const startsAt = new Date(dto.startsAt);
        const endsAt = new Date(dto.endsAt);
        if (endsAt <= startsAt) {
            throw new common_1.BadRequestException('endsAt must be after startsAt');
        }
        const delay = endsAt.getTime() - Date.now();
        if (delay <= 0) {
            throw new common_1.BadRequestException('endsAt must be in the future');
        }
        const tournament = await this.prisma.tournament.create({
            data: {
                name: dto.name,
                startsAt,
                endsAt,
                status: 'PENDING',
            },
        });
        await this.snapshotQueue.add('snapshot', { tournamentId: tournament.id }, { delay });
        return { id: tournament.id };
    }
    async getLeaderboard(id, limit, offset) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
        });
        if (!tournament) {
            throw new common_1.BadRequestException('Tournament not found');
        }
        if (tournament.status === 'COMPLETED') {
            const results = await this.prisma.tournamentResult.findMany({
                where: { tournamentId: id },
                orderBy: { rank: 'asc' },
                skip: offset,
                take: limit,
            });
            return results.map((r) => ({
                playerId: r.playerId,
                score: r.score,
                rank: r.rank,
            }));
        }
        const key = `tournament:${id}:leaderboard`;
        const redisResults = await this.redis.zrevrange(key, offset, offset + limit - 1, 'WITHSCORES');
        const formatted = [];
        for (let i = 0; i < redisResults.length; i += 2) {
            formatted.push({
                playerId: redisResults[i],
                score: parseInt(redisResults[i + 1], 10),
                rank: offset + Math.floor(i / 2) + 1,
            });
        }
        return formatted;
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('tournament-snapshot')),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_1.PrismaService !== "undefined" && prisma_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof redis_1.RedisService !== "undefined" && redis_1.RedisService) === "function" ? _b : Object, typeof (_c = typeof bullmq_2.Queue !== "undefined" && bullmq_2.Queue) === "function" ? _c : Object])
], TournamentsService);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("bullmq");

/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TournamentsController = void 0;
const common_1 = __webpack_require__(2);
const tournaments_service_1 = __webpack_require__(19);
const create_tournament_dto_1 = __webpack_require__(22);
let TournamentsController = class TournamentsController {
    tournamentsService;
    constructor(tournamentsService) {
        this.tournamentsService = tournamentsService;
    }
    async create(createTournamentDto) {
        return this.tournamentsService.create(createTournamentDto);
    }
    async getLeaderboard(id, limit, offset) {
        return this.tournamentsService.getLeaderboard(id, limit, offset);
    }
};
exports.TournamentsController = TournamentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_tournament_dto_1.CreateTournamentDto !== "undefined" && create_tournament_dto_1.CreateTournamentDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/leaderboard'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getLeaderboard", null);
exports.TournamentsController = TournamentsController = __decorate([
    (0, common_1.Controller)('tournaments'),
    __metadata("design:paramtypes", [typeof (_a = typeof tournaments_service_1.TournamentsService !== "undefined" && tournaments_service_1.TournamentsService) === "function" ? _a : Object])
], TournamentsController);


/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateTournamentDto = void 0;
const class_validator_1 = __webpack_require__(23);
class CreateTournamentDto {
    name;
    startsAt;
    endsAt;
}
exports.CreateTournamentDto = CreateTournamentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "startsAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTournamentDto.prototype, "endsAt", void 0);


/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BetsModule = void 0;
const common_1 = __webpack_require__(2);
const bets_service_1 = __webpack_require__(25);
const bets_controller_1 = __webpack_require__(26);
let BetsModule = class BetsModule {
};
exports.BetsModule = BetsModule;
exports.BetsModule = BetsModule = __decorate([
    (0, common_1.Module)({
        providers: [bets_service_1.BetsService],
        controllers: [bets_controller_1.BetsController],
    })
], BetsModule);


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BetsService = void 0;
const common_1 = __webpack_require__(2);
const client_1 = __webpack_require__(16);
const prisma_1 = __webpack_require__(13);
const redis_1 = __webpack_require__(9);
let BetsService = class BetsService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async ingest(dto) {
        const betTime = new Date(dto.createdAt);
        const activeTournaments = await this.prisma.tournament.findMany({
            where: {
                status: { in: ['PENDING', 'ACTIVE'] },
                startsAt: { lte: betTime },
                endsAt: { gte: betTime },
            },
        });
        if (activeTournaments.length === 0) {
            throw new common_1.BadRequestException('Bet does not qualify for any active tournament');
        }
        let processedCount = 0;
        let duplicateCount = 0;
        for (const tournament of activeTournaments) {
            try {
                await this.prisma.tournamentBet.create({
                    data: {
                        tournamentId: tournament.id,
                        externalBetId: dto.externalBetId,
                        playerId: dto.playerId,
                        amount: dto.amount,
                        currency: dto.currency,
                        createdAt: betTime,
                    },
                });
                const key = `tournament:${tournament.id}:leaderboard`;
                await this.redis.zincrby(key, dto.amount, dto.playerId);
                processedCount++;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002') {
                    duplicateCount++;
                    continue;
                }
                throw error;
            }
        }
        return { status: 'ok', processedCount, duplicateCount };
    }
};
exports.BetsService = BetsService;
exports.BetsService = BetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_1.PrismaService !== "undefined" && prisma_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof redis_1.RedisService !== "undefined" && redis_1.RedisService) === "function" ? _b : Object])
], BetsService);


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BetsController = void 0;
const common_1 = __webpack_require__(2);
const bets_service_1 = __webpack_require__(25);
const create_bet_dto_1 = __webpack_require__(27);
let BetsController = class BetsController {
    betsService;
    constructor(betsService) {
        this.betsService = betsService;
    }
    async ingest(createBetDto) {
        return this.betsService.ingest(createBetDto);
    }
};
exports.BetsController = BetsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_bet_dto_1.CreateBetDto !== "undefined" && create_bet_dto_1.CreateBetDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], BetsController.prototype, "ingest", null);
exports.BetsController = BetsController = __decorate([
    (0, common_1.Controller)('bet'),
    __metadata("design:paramtypes", [typeof (_a = typeof bets_service_1.BetsService !== "undefined" && bets_service_1.BetsService) === "function" ? _a : Object])
], BetsController);


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateBetDto = void 0;
const class_validator_1 = __webpack_require__(23);
class CreateBetDto {
    externalBetId;
    playerId;
    amount;
    currency;
    createdAt;
}
exports.CreateBetDto = CreateBetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBetDto.prototype, "externalBetId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBetDto.prototype, "playerId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBetDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBetDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBetDto.prototype, "createdAt", void 0);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const platform_fastify_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();

})();

/******/ })()
;