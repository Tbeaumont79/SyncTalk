<?php

namespace App\Controller;

use App\Entity\Message;
use App\Service\MessageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MessageController extends AbstractController
{
    private $messageService;
    private $em;
    public function __construct(MessageService $messageService, EntityManagerInterface $em) {
        $this->messageService = $messageService;
        $this->em = $em;
    }
    

    #[Route('/api/message', name: 'get_message', methods: ['GET'])]
    public function getMessage() : Response {
        $messages = $this->em->getRepository(Message::class)->findAll();
        $formattedMessages = array_map(function($message) {
            return [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'author' => [
                    'username' => $message->getAuthor()->getUsername()
                ],
                'created_at' => $message->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }, $messages);
        return $this->json($formattedMessages);
    }

    #[Route('/api/message', name: 'send_message', methods: ['POST'])]
    public function sendMessage(Request $request) {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['content'])) {
            throw new \Exception("Message content is required");
        }
        $content = $data['content'];
        $author = $this->getUser();
        if ($author) {
            $author = $author->getUserIdentifier();
        }
        else {
            throw new \Exception("No User is authenticated ! ");
        }
        $response = $this->messageService->sendMessage($content, $author);
        return $this->json($response, Response::HTTP_CREATED);
    }
}
