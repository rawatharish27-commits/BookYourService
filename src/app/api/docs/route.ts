import { NextRequest } from 'next/server'

// Basic API documentation endpoint
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const openApiSpec = {
    openapi: '3.0.1',
    info: {
      title: 'Help2Earn API',
      description: 'Production-grade marketplace API for Help2Earn platform',
      version: '1.0.0',
      contact: {
        name: 'Help2Earn Support',
        email: 'support@help2earn.com'
      }
    },
    servers: [
      {
        url: `${baseUrl}/api/v1`,
        description: 'Production API v1'
      }
    ],
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      '/auth/send-otp': {
        post: {
          summary: 'Send OTP for authentication',
          description: 'Send a 6-digit OTP to the provided phone number',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['phone'],
                  properties: {
                    phone: {
                      type: 'string',
                      pattern: '^[6-9]\\d{9}$',
                      description: '10-digit Indian phone number'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'OTP sent successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'OTP sent successfully' },
                      expiresIn: { type: 'number', example: 300 }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid phone number',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' },
                      details: { type: 'object' }
                    }
                  }
                }
              }
            },
            429: {
              description: 'Rate limit exceeded'
            }
          }
        }
      },
      '/auth/verify-otp': {
        post: {
          summary: 'Verify OTP and authenticate user',
          description: 'Verify the OTP code and return JWT token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['phone', 'otp'],
                  properties: {
                    phone: {
                      type: 'string',
                      pattern: '^[6-9]\\d{9}$',
                      description: '10-digit Indian phone number'
                    },
                    otp: {
                      type: 'string',
                      pattern: '^\\d{6}$',
                      description: '6-digit OTP code'
                    },
                    name: {
                      type: 'string',
                      minLength: 2,
                      maxLength: 50,
                      description: 'User name (optional for existing users)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Authentication successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          phone: { type: 'string' },
                          name: { type: 'string', nullable: true },
                          trustScore: { type: 'number' },
                          paymentActive: { type: 'boolean' },
                          isAdmin: { type: 'boolean' },
                          isFrozen: { type: 'boolean' }
                        }
                      },
                      token: { type: 'string' },
                      isNewUser: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid OTP or input'
            },
            429: {
              description: 'Rate limit exceeded'
            }
          }
        }
      },
      '/problems': {
        get: {
          summary: 'Get problems with filters',
          description: 'Retrieve problems with optional filtering and pagination',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by user ID'
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'EXPIRED', 'CANCELLED']
              }
            },
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['EMERGENCY', 'TIME_ACCESS', 'RESOURCE_RENT']
              }
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', minimum: 0, default: 0 }
            }
          ],
          responses: {
            200: {
              description: 'Problems retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      problems: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            type: { type: 'string' },
                            riskLevel: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            offerPrice: { type: 'number', nullable: true },
                            status: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            expiresAt: { type: 'string', format: 'date-time', nullable: true },
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                phone: { type: 'string' },
                                name: { type: 'string', nullable: true },
                                trustScore: { type: 'number' }
                              }
                            }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          limit: { type: 'number' },
                          offset: { type: 'number' },
                          hasMore: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Authentication required'
            }
          }
        },
        post: {
          summary: 'Create a new problem',
          description: 'Post a new help request',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type', 'title', 'description'],
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['EMERGENCY', 'TIME_ACCESS', 'RESOURCE_RENT']
                    },
                    title: {
                      type: 'string',
                      minLength: 5,
                      maxLength: 100
                    },
                    description: {
                      type: 'string',
                      minLength: 10,
                      maxLength: 1000
                    },
                    offerPrice: {
                      type: 'number',
                      minimum: 0,
                      maximum: 10000
                    },
                    latitude: {
                      type: 'number',
                      minimum: -90,
                      maximum: 90
                    },
                    longitude: {
                      type: 'number',
                      minimum: -180,
                      maximum: 180
                    },
                    locationText: {
                      type: 'string',
                      maxLength: 200
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Problem created successfully'
            },
            400: {
              description: 'Invalid input or daily limit reached'
            },
            401: {
              description: 'Authentication required'
            },
            403: {
              description: 'Active subscription required'
            },
            429: {
              description: 'Rate limit exceeded'
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }

  return Response.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
