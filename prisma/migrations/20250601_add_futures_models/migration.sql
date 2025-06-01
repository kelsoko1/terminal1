-- CreateEnum
CREATE TYPE "FutureContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DELIVERY', 'SETTLEMENT');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "CommodityFuture" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "baseAsset" TEXT NOT NULL,
    "contractSize" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "expiryMonth" TEXT NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openInterest" INTEGER NOT NULL DEFAULT 0,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "initialMargin" DOUBLE PRECISION NOT NULL,
    "maintenanceMargin" DOUBLE PRECISION NOT NULL,
    "status" "FutureContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommodityFuture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxFuture" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "quoteCurrency" TEXT NOT NULL,
    "minAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FxFuture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxExpiryDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT NOT NULL,
    "spotPrice" DOUBLE PRECISION NOT NULL,
    "futurePremium" DOUBLE PRECISION NOT NULL,
    "openInterest" INTEGER NOT NULL DEFAULT 0,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "fxFutureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FxExpiryDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FutureOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "futureId" TEXT NOT NULL,
    "side" "OrderSide" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "filledQuantity" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FutureOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FutureTrade" (
    "id" TEXT NOT NULL,
    "futureId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "buyerOrderId" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FutureTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxFutureOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiryDateId" TEXT NOT NULL,
    "side" "OrderSide" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "filledQuantity" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FxFutureOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxFutureTrade" (
    "id" TEXT NOT NULL,
    "expiryDateId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "buyerOrderId" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FxFutureTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommodityFuture_symbol_key" ON "CommodityFuture"("symbol");

-- AddForeignKey
ALTER TABLE "FxExpiryDate" ADD CONSTRAINT "FxExpiryDate_fxFutureId_fkey" FOREIGN KEY ("fxFutureId") REFERENCES "FxFuture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureOrder" ADD CONSTRAINT "FutureOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureOrder" ADD CONSTRAINT "FutureOrder_futureId_fkey" FOREIGN KEY ("futureId") REFERENCES "CommodityFuture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureTrade" ADD CONSTRAINT "FutureTrade_futureId_fkey" FOREIGN KEY ("futureId") REFERENCES "CommodityFuture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureTrade" ADD CONSTRAINT "FutureTrade_buyerOrderId_fkey" FOREIGN KEY ("buyerOrderId") REFERENCES "FutureOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureTrade" ADD CONSTRAINT "FutureTrade_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "FutureOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FxFutureOrder" ADD CONSTRAINT "FxFutureOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FxFutureOrder" ADD CONSTRAINT "FxFutureOrder_expiryDateId_fkey" FOREIGN KEY ("expiryDateId") REFERENCES "FxExpiryDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FxFutureTrade" ADD CONSTRAINT "FxFutureTrade_expiryDateId_fkey" FOREIGN KEY ("expiryDateId") REFERENCES "FxExpiryDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FxFutureTrade" ADD CONSTRAINT "FxFutureTrade_buyerOrderId_fkey" FOREIGN KEY ("buyerOrderId") REFERENCES "FxFutureOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FxFutureTrade" ADD CONSTRAINT "FxFutureTrade_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "FxFutureOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
