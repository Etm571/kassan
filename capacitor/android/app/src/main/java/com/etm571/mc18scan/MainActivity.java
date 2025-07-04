package com.etm571.mc18scan;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;


public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EchoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}