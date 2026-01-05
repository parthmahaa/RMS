package com.rms.service;

import com.rms.config.RabbitMqConfig;
import com.rms.dto.EmailDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RabbitMqConsumer {

    private final EmailService emailService;
    private final Logger logger = LoggerFactory.getLogger(RabbitMqConsumer.class);

    @RabbitListener(queues = RabbitMqConfig.QUEUE)
    public void consumeEmail(EmailDTO message){
        logger.info("Received email event: {} for {}", message.getEmailType(),message.getTo());

        emailService.sendMail(message);
    }
}
