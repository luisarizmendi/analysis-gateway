package org.larizmen.analysis.gateway;
import org.larizmen.analysis.domain.*;

import io.quarkus.runtime.annotations.RegisterForReflection;

import javax.enterprise.context.ApplicationScoped;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;

import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

import java.util.concurrent.CompletableFuture;



@RegisterForReflection
@ApplicationScoped
public class KafkaService {

    Logger logger = LoggerFactory.getLogger(KafkaService.class);

    @Inject
    @Channel("orders-in")
    Emitter<PlaceOrderCommand> ordersOutEmitter;

    public CompletableFuture<Void> placeOrder(final PlaceOrderCommand placeOrderCommand){

        logger.debug("PlaceOrderCommandReceived: {}", placeOrderCommand);

        return ordersOutEmitter.send(placeOrderCommand)
            .whenComplete((result, ex) -> {
                logger.debug("order sent: {}", placeOrderCommand);
              //  logger.debug("order sent JSON: {}", toJson(placeOrderCommand));
                if (ex != null) {
                    logger.error(ex.getMessage());
                }
            }).toCompletableFuture();
    }
}
