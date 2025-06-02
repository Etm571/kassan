package com.etm571.mc18scan;

import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.PluginMethod;

import com.symbol.emdk.EMDKManager;
import com.symbol.emdk.personalshopper.CradleLedFlashInfo;
import com.symbol.emdk.personalshopper.CradleResults;
import com.symbol.emdk.personalshopper.PersonalShopper;
import com.symbol.emdk.personalshopper.CradleException;

@CapacitorPlugin(name = "ZebraCradleUnlock")
public class ZebraCradleUnlockPlugin extends Plugin implements EMDKManager.EMDKListener {

    private EMDKManager emdkManager;
    private PersonalShopper psObject;

    @PluginMethod
    public void unlock(PluginCall call) {
        if (psObject == null || psObject.cradle == null) {
            call.reject("Cradle not initialized");
            return;
        }

        try {
            CradleLedFlashInfo flashInfo = new CradleLedFlashInfo(500, 500, false);
            CradleResults result = psObject.cradle.unlock(15, flashInfo);

            if (result == CradleResults.SUCCESS) {
                call.resolve();
            } else {
                call.reject("Unlock failed: " + result.getDescription());
            }
        } catch (CradleException e) {
            call.reject("CradleException: " + e.getMessage());
        }
    }

    @Override
    public void load() {
        EMDKManager.getEMDKManager(getContext(), this);
    }

    @Override
    public void onOpened(EMDKManager emdkManager) {
        this.emdkManager = emdkManager;
        psObject = (PersonalShopper) emdkManager.getInstance(EMDKManager.FEATURE_TYPE.PERSONALSHOPPER);
    }

    @Override
    public void onClosed() {
        if (emdkManager != null) {
            emdkManager.release();
            emdkManager = null;
        }
    }
}
