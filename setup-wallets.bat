@echo off
echo.
echo ========================================
echo   DAPPER DOGGOS - Wallet Setup
echo ========================================
echo.
echo This script will help you configure your wallet addresses
echo for the 15%% artist / 85%% team revenue split.
echo.
echo You need 3 Solana wallet addresses:
echo.
echo 1. Collection Wallet (receives mint payments initially)
echo 2. Artist Wallet (receives 15%% of all revenue)
echo 3. Team/Marketing Wallet (receives 85%% of all revenue)
echo.
echo ========================================
echo.
pause
echo.
echo Please enter your wallet addresses:
echo.
set /p ARTIST_WALLET="Artist Wallet Address: "
echo.
set /p TEAM_WALLET="Team/Marketing Wallet Address: "
echo.
set /p COLLECTION_WALLET="Collection Wallet Address (press Enter to keep current): "
echo.
echo ========================================
echo   Confirm Your Addresses
echo ========================================
echo.
echo Artist Wallet (15%%):  %ARTIST_WALLET%
echo Team Wallet (85%%):    %TEAM_WALLET%
if "%COLLECTION_WALLET%"=="" (
    echo Collection Wallet:  EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3 (unchanged)
) else (
    echo Collection Wallet:  %COLLECTION_WALLET%
)
echo.
set /p CONFIRM="Is this correct? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo Setup cancelled. Please run the script again.
    pause
    exit /b
)

echo.
echo ========================================
echo   Updating Configuration Files...
echo ========================================
echo.

echo [1/3] Updating config_fresh.json...
echo Please manually update config_fresh.json with these addresses:
echo   - Artist: %ARTIST_WALLET%
echo   - Team: %TEAM_WALLET%
echo.

echo [2/3] Updating split-payments.mjs...
echo Please manually update split-payments.mjs lines 22-24 with:
echo   artistWallet: "%ARTIST_WALLET%"
echo   teamWallet: "%TEAM_WALLET%"
echo.

echo [3/3] Updating update-metadata-creators.mjs...
echo Please manually update update-metadata-creators.mjs lines 14-15 with:
echo   artistWallet: "%ARTIST_WALLET%"
echo   teamWallet: "%TEAM_WALLET%"
echo.

echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. Manually update the files mentioned above
echo 2. Run: node update-metadata-creators.mjs
echo 3. Test with: node split-payments.mjs status
echo.
echo See PAYMENT-SPLITTING-GUIDE.md for detailed instructions.
echo.
pause


