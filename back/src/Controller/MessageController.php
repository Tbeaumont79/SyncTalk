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
        return $this->json($messages);
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
        $this->messageService->sendMessage($content, $author);
        return $this->json([$content], Response::HTTP_CREATED);
    }
}
