package org.larizmen.analysis.gateway;

import org.larizmen.analysis.domain.*;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.concurrent.CompletionStage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import io.quarkus.runtime.annotations.RegisterForReflection;



@RegisterForReflection
@Path("/")
public class RestResource {

    Logger logger = LoggerFactory.getLogger(RestResource.class);



    @ConfigProperty(name="streamUrl")
    String streamUrl;

    @Inject
    KafkaService orderService;

    @Inject
    Template indexTemplate;

    @GET
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance getIndex(){
        return indexTemplate
                .data("streamUrl", streamUrl);
    }

    @POST
    @Path("order")

    public CompletionStage<Response> orderIn(final PlaceOrderCommand placeOrderCommand) {
        logger.debug("order received: {}", placeOrderCommand.toString());

        return orderService.placeOrder(placeOrderCommand)
            .thenApply(res -> {
                return Response.accepted().entity(placeOrderCommand).build();
            }).exceptionally(ex -> {
                    logger.error(ex.getMessage());
                    return Response.serverError().entity(ex).build();
            });
    }

}
