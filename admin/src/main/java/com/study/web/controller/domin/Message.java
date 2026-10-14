package com.study.web.controller.domin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class Message implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //发送者ID
    private Long senderId;
    //接收者ID
    private Long receiverId;
    //消息类型：1-系统通知，2-投递通知，3-面试邀约，4-聊天消息
    private Integer type;
    //消息内容
    private String content;
    //是否已读：0-未读，1-已读
    private Integer isRead;
    //创建时间
    private Date createTime;
}