import { useEffect } from "react";
import { CapacitorIntents } from "capacitor-android-intents-capacitor6";
import { submitScan } from "./handleScan";

const usePowerConnectedListener = (
  getItems: () => any,
  userId: string,
  token: string,
  log: (msg: string) => void,
  navigate: any
) => {
  useEffect(() => {
    const isMounted = { current: true };
    let connectId: string | undefined;

    const registerReceivers = async () => {
      try {
        connectId = await CapacitorIntents.registerBroadcastReceiver(
          { filters: ["android.intent.action.ACTION_POWER_CONNECTED"] },
          async () => {
            if (isMounted.current) {
              await submitScan(getItems, userId, token, log, navigate);
            }
          }
        );
      } catch (error) {
        log(`Failed to register power connected receiver: ${error}`);
      }
    };

    registerReceivers();

    return () => {
      isMounted.current = false;
      if (connectId && CapacitorIntents.unregisterBroadcastReceiver) {
        CapacitorIntents.unregisterBroadcastReceiver({ id: connectId });
      }
    };
  }, [getItems, userId, token, log, navigate]);
};

export default usePowerConnectedListener;
