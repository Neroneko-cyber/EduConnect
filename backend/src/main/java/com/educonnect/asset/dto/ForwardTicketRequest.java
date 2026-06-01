package com.educonnect.asset.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ForwardTicketRequest {
    private BigDecimal estimatedCost;
}