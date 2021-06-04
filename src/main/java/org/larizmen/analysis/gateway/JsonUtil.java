package org.larizmen.analysis.gateway;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.runtime.annotations.RegisterForReflection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RegisterForReflection
public class JsonUtil {

    static Logger logger = LoggerFactory.getLogger(JsonUtil.class);

    static final ObjectMapper objectMapper = new ObjectMapper();

    static String toJson(final Object object) {
        logger.debug("marshalling {} to JSON", object.toString());
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            logger.error(e.getMessage());
            return "{ \"error\" : \"" + e.getMessage() + "\" }";
        }
    }

}
